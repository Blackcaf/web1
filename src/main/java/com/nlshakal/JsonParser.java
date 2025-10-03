package com.nlshakal;

import java.math.BigDecimal;
import java.math.MathContext;

public class JsonParser {
  private static final MathContext MC = new MathContext(50);

  public BigDecimal[] getBigDecimals(String requestString) throws IllegalArgumentException {
    try {
      requestString = requestString.replaceAll("[{}\"]", "");
      String[] parts = requestString.split(",");

      String xStr = parts[0].split(":")[1].trim().replace(",", ".");
      String yStr = parts[1].split(":")[1].trim().replace(",", ".");
      String rStr = parts[2].split(":")[1].trim().replace(",", ".");

      BigDecimal x = new BigDecimal(xStr, MC);
      BigDecimal y = new BigDecimal(yStr, MC);
      BigDecimal r = new BigDecimal(rStr, MC);

      return new BigDecimal[] { x, y, r };
    } catch (Exception e) {
      throw new IllegalArgumentException("Invalid JSON format");
    }
  }
}