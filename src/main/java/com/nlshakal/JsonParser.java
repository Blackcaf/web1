package com.nlshakal;

import java.math.BigDecimal;
import java.math.MathContext;

public class JsonParser implements RequestParser {
  private static final MathContext MC = new MathContext(100);

  @Override
  public BigDecimal[] getBigDecimals(String requestString) throws IllegalArgumentException {
    try {
      requestString = requestString.replaceAll("[{}\"]", "");
      String[] parts = requestString.split(",");

      String xStr = parts[0].split(":")[1].trim().replace(",", ".");
      String yStr = parts[1].split(":")[1].trim().replace(",", ".");
      String rStr = parts[2].split(":")[1].trim().replace(",", ".");

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