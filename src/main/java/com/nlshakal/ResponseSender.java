package com.nlshakal;

import com.fastcgi.FCGIInterface;
import com.google.gson.Gson;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

public class ResponseSender {
  private final Validator validator = new Validator();
  private final HitChecker hitChecker = new HitChecker();
  private final RequestParser parser = new JsonParsers();
  private final OutputHandler outputHandler = new FastCGIOutputHandler();
  private final SimpleDateFormat dateFormatter = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
  private final Gson gson = new Gson();

  public ResponseSender() { dateFormatter.setTimeZone(TimeZone.getTimeZone("UTC")); }

  public void sendResponse() {
    try {
      long startTime = System.nanoTime();
      String uri = FCGIInterface.request.params.getProperty("REQUEST_URI");
      String method = FCGIInterface.request.params.getProperty("REQUEST_METHOD");

      if (!"POST".equalsIgnoreCase(method)) {
        sendError(405, "Только POST допустим", "Allow: POST\n");
        return;
      }

      String shape = extractShape(uri);
      if (shape == null) {
        sendError(404, "Эндпоинт не найден");
        return;
      }

      BigDecimal[] data = readRequestBody();
      validator.validate(data[0], data[1], data[2]);

      Map<String, Object> response = new LinkedHashMap<>();
      response.put("x", data[0].toPlainString());
      response.put("y", data[1].toPlainString());
      response.put("r", data[2].toPlainString());
      response.put("hit", calculateHit(data[0], data[1], data[2], shape));
      response.put("shape", shape);
      response.put("currentTime", dateFormatter.format(new Date()));
      response.put("scriptTimeMs", String.format("%.2f", (System.nanoTime() - startTime) / 1000000.0));

      sendJson(200, response);
    } catch (IllegalArgumentException e) {
      sendError(400, e.getMessage());
    } catch (Exception e) {
      sendError(500, "Ошибка сервера: " + e.getMessage());
    }
  }

  private String extractShape(String uri) {
    if ("/calculate".equals(uri)) return "all";
    if ("/calculate/circle".equals(uri)) return "circle";
    if ("/calculate/rectangle".equals(uri)) return "rectangle";
    if ("/calculate/triangle".equals(uri)) return "triangle";
    return null;
  }

  private boolean calculateHit(BigDecimal x, BigDecimal y, BigDecimal r, String shape) {
    switch (shape) {
      case "circle": return hitChecker.isCircleHit(x, y, r);
      case "rectangle": return hitChecker.isRectangleHit(x, y, r);
      case "triangle": return hitChecker.isTriangleHit(x, y, r);
      default: return hitChecker.isHit(x, y, r);
    }
  }

  private BigDecimal[] readRequestBody() throws IOException {
    FCGIInterface.request.inStream.fill();
    int length = FCGIInterface.request.inStream.available();
    if (length <= 0) throw new IllegalArgumentException("Пустое тело запроса");

    byte[] raw = new byte[length];
    FCGIInterface.request.inStream.read(raw, 0, length);
    return parser.getBigDecimals(new String(raw, StandardCharsets.UTF_8));
  }

  private void sendJson(int status, Object data) {
    send(status, gson.toJson(data), "");
  }

  private void sendError(int status, String message) { sendError(status, message, ""); }

  private void sendError(int status, String message, String extraHeaders) {
    send(status, gson.toJson(Collections.singletonMap("error", message)), extraHeaders);
  }

  private void send(int status, String json, String extraHeaders) {
    try {
      outputHandler.send(String.format("Status: %d\nContent-Type: application/json\nAccess-Control-Allow-Origin: *\n%sContent-Length: %d\n\n%s\n",
          status, extraHeaders, json.getBytes(StandardCharsets.UTF_8).length, json));
    } catch (IOException e) { e.printStackTrace(); }
  }
}