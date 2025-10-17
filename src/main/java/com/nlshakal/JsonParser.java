package com.nlshakal;

import java.math.BigDecimal;
import java.math.MathContext;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class JsonParser implements RequestParser {
  private static final MathContext MC = new MathContext(100);

  @Override
  public BigDecimal[] getBigDecimals(String requestString) throws IllegalArgumentException {
    try {
      if (requestString == null) {
        throw new IllegalArgumentException("Пустое тело запроса");
      }

      // Find x, y, r by key name in any order; ignore extra fields
      // Accept numbers with optional quotes and with ',' or '.' as decimal separators
      Pattern pairPattern = Pattern.compile("\"(x|y|r)\"\\s*:\\s*\"?(-?\\d*(?:[\\.,]\\d+)?)\"?", Pattern.CASE_INSENSITIVE);
      Matcher matcher = pairPattern.matcher(requestString);
      Map<String, String> values = new HashMap<>();
      while (matcher.find()) {
        String key = matcher.group(1).toLowerCase(Locale.ROOT);
        String val = matcher.group(2);
        values.put(key, val);
      }

      String xStr = values.get("x");
      String yStr = values.get("y");
      String rStr = values.get("r");

      if (xStr == null || yStr == null || rStr == null) {
        throw new IllegalArgumentException("Требуются поля x, y, r в теле запроса");
      }

      xStr = xStr.trim().replace(',', '.');
      yStr = yStr.trim().replace(',', '.');
      rStr = rStr.trim().replace(',', '.');

      if (!yStr.matches("^-?\\d*\\.?\\d+$")) {
        throw new IllegalArgumentException("Y должен быть допустимым десятичным числом");
      }
      if (yStr.length() > 100) {
        throw new IllegalArgumentException("Y значение слишком длинное (максимум 100 символов)");
      }

      BigDecimal x = new BigDecimal(xStr, MC);
      BigDecimal y = new BigDecimal(yStr, MC);
      BigDecimal r = new BigDecimal(rStr, MC);

      return new BigDecimal[] { x, y, r };
    } catch (Exception e) {
      throw new IllegalArgumentException("Неверный формат JSON: " + e.getMessage());
    }
  }

  @Override
  public String getOriginalYString() {
    return null;
  }
}
