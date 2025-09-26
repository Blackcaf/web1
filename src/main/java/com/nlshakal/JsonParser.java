package com.nlshakal;


import java.math.BigDecimal;

public class JsonParser {
  public BigDecimal[] getBigDecimals(String requestString) throws IllegalArgumentException {
    try {
      requestString = requestString.replaceAll("[{}\"]", "");
      String[] parts = requestString.split(",");
      BigDecimal x = new BigDecimal(parts[0].split(":")[1].trim().replace(",", "."));
      BigDecimal y = new BigDecimal(parts[1].split(":")[1].trim().replace(",", "."));
      BigDecimal r = new BigDecimal(parts[2].split(":")[1].trim().replace(",", "."));
      return new BigDecimal[] { x, y, r };
    } catch (Exception e) {
      throw new IllegalArgumentException("");
    }
  }
}

