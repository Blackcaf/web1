package com.nlshakal;

import com.fastcgi.FCGIInterface;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.TimeZone;

public class ResponseSender {
  private final Validator validator;
  private final HitChecker hitChecker;
  private final RequestParser parser;
  private final OutputHandler outputHandler;
  private final SimpleDateFormat dateFormatter;
  private final Gson gson;

  public ResponseSender() { this(new Validator(), new HitChecker(), new JsonParsers(), new FastCGIOutputHandler());}

  public ResponseSender(Validator validator, HitChecker hitChecker, RequestParser parser, OutputHandler outputHandler) {
    this.validator = validator;
    this.hitChecker = hitChecker;
    this.parser = parser;
    this.outputHandler = outputHandler;
    this.dateFormatter = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
    this.dateFormatter.setTimeZone(TimeZone.getTimeZone("UTC"));
    this.gson = new GsonBuilder().setPrettyPrinting().create();
  }

  public void sendResponse() {
    try {
      long startTime = System.nanoTime();
      String requestUri = FCGIInterface.request.params.getProperty("REQUEST_URI");
      String method = FCGIInterface.request.params.getProperty("REQUEST_METHOD");

      if (requestUri == null) {
        sendErrorResponse(404, "Отсутствует URI запроса");
        return;
      }

      if (method == null || !"POST".equalsIgnoreCase(method)) {
        sendMethodNotAllowed("Только POST допустим. Получен: " + method);
        return;
      }

      String shape = extractShape(requestUri);
      if (shape == null) {
        sendErrorResponse(404, "Эндпоинт не найден. Доступные: /calculate /calculate/circle /calculate/rectangle /calculate/triangle");
        return;
      }

      handleCalculate(startTime, shape);
    } catch (IllegalArgumentException e) {
      sendErrorResponse(400, e.getMessage());
    } catch (Exception e) {
      sendErrorResponse(500, "Ошибка сервера: " + e.getMessage());
    }
  }

  private String extractShape(String uri) {
    if (uri.equals("/calculate")) return "all";
    if (uri.equals("/calculate/circle")) return "circle";
    if (uri.equals("/calculate/rectangle")) return "rectangle";
    if (uri.equals("/calculate/triangle")) return "triangle";
    return null;
  }

  private void handleCalculate(long startTime, String shape) throws IOException {
    BigDecimal[] data = readRequestBody();
    BigDecimal x = data[0];
    BigDecimal y = data[1];
    BigDecimal r = data[2];

    try {
      validator.validate(x, y, r);
    } catch (IllegalArgumentException e) {
      sendErrorResponse(400, e.getMessage());
      return;
    }

    boolean hit = calculateHit(x, y, r, shape);
    double scriptTimeMs = (System.nanoTime() - startTime) / 1000000.0;

    Map<String, Object> response = new LinkedHashMap<>();
    response.put("x", x.toPlainString());
    response.put("y", y.toPlainString());
    response.put("r", r.toPlainString());
    response.put("hit", hit);
    response.put("shape", shape);
    response.put("currentTime", dateFormatter.format(new Date()));
    response.put("scriptTimeMs", String.format("%.2f", scriptTimeMs));

    sendJson(response, 200);
  }

  private boolean calculateHit(BigDecimal x, BigDecimal y, BigDecimal r, String shape) {
    switch (shape) {
      case "all": return hitChecker.isHit(x, y, r);
      case "circle": return hitChecker.isCircleHit(x, y, r);
      case "rectangle": return hitChecker.isRectangleHit(x, y, r);
      case "triangle": return hitChecker.isTriangleHit(x, y, r);
      default: throw new IllegalArgumentException("Неизвестная фигура: " + shape);
    }
  }

  private BigDecimal[] readRequestBody() throws IOException {
    FCGIInterface.request.inStream.fill();
    int length = FCGIInterface.request.inStream.available();

    if (length <= 0) {throw new IllegalArgumentException("Empty request body");}

    ByteBuffer buffer = ByteBuffer.allocate(length);
    int readBytes = FCGIInterface.request.inStream.read(buffer.array(), 0, length);
    byte[] raw = new byte[readBytes];
    buffer.get(raw);
    String request = new String(raw, StandardCharsets.UTF_8);

    return parser.getBigDecimals(request);
  }

  private void sendJson(Map<String, Object> data, int status) {
    String json = gson.toJson(data);
    sendHttpResponse(status, json);
  }

  private void sendErrorResponse(int status, String message) {
    Map<String, String> error = new LinkedHashMap<>();
    error.put("error", message);
    String json = gson.toJson(error);
    sendHttpResponse(status, json);
  }

  private void sendMethodNotAllowed(String message) {
    Map<String, String> error = new LinkedHashMap<>();
    error.put("error", message);
    String json = gson.toJson(error);
    String httpResponse = String.format(
        "Status: 405 Method Not Allowed\nContent-Type: application/json\nAccess-Control-Allow-Origin: *\nAllow: POST\nContent-Length: %d\n\n%s\n",
        json.getBytes(StandardCharsets.UTF_8).length, json
    );
    try {
      outputHandler.send(httpResponse);
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  private void sendHttpResponse(int status, String json) {
    String statusText = getStatusText(status);
    String httpResponse = String.format(
        "Status: %d %s\nContent-Type: application/json\nAccess-Control-Allow-Origin: *\nContent-Length: %d\n\n%s\n",
        status, statusText, json.getBytes(StandardCharsets.UTF_8).length, json
    );
    try {
      outputHandler.send(httpResponse);
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  private String getStatusText(int status) {
    switch (status) {
      case 200: return "OK";
      case 400: return "Bad Request";
      case 404: return "Not Found";
      case 405: return "Method Not Allowed";
      case 500: return "Internal Server Error";
      default: return "Unknown";
    }
  }
}