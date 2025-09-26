package com.nlshakal;

import java.math.BigDecimal;

public class Checker {
  private static final BigDecimal X_MIN = new BigDecimal("-2");

  private static final BigDecimal X_MAX = new BigDecimal("2");

  private static final BigDecimal Y_MIN = new BigDecimal("-5");

  private static final BigDecimal Y_MAX = new BigDecimal("3");

  private static final BigDecimal R_MIN = BigDecimal.ONE;

  private static final BigDecimal R_MAX = new BigDecimal("5");

  public void validate(BigDecimal x, BigDecimal y, BigDecimal r) {
    if (x.compareTo(X_MIN) < 0 || x.compareTo(X_MAX) > 0)
      throw new IllegalArgumentException("X [-2; 2]");
    if (y.compareTo(Y_MIN) < 0 || y.compareTo(Y_MAX) > 0)
      throw new IllegalArgumentException("Y [-5; 3]");
    if (r.compareTo(R_MIN) < 0 || r.compareTo(R_MAX) > 0 || r.stripTrailingZeros().scale() > 0)
      throw new IllegalArgumentException("R 1 5");
  }

  public boolean isHit(BigDecimal x, BigDecimal y, BigDecimal r) {
    return (checkCircle(x, y, r) || checkRectangle(x, y, r) || checkTriangle(x, y, r));
  }

  private boolean checkCircle(BigDecimal x, BigDecimal y, BigDecimal r) {
    if (x.compareTo(BigDecimal.ZERO) < 0 || y.compareTo(BigDecimal.ZERO) < 0)
      return false;
    return (x.multiply(x).add(y.multiply(y)).compareTo(r.multiply(r)) <= 0);
  }

  private boolean checkRectangle(BigDecimal x, BigDecimal y, BigDecimal r) {
    BigDecimal halfR = r.divide(BigDecimal.valueOf(2L));
    return (x.compareTo(BigDecimal.ZERO) >= 0 && y
        .compareTo(BigDecimal.ZERO) <= 0 && x
        .compareTo(halfR) <= 0 && y
        .compareTo(r.negate()) >= 0);
  }

  private boolean checkTriangle(BigDecimal x, BigDecimal y, BigDecimal r) {
    return (x.compareTo(BigDecimal.ZERO) <= 0 && y
        .compareTo(BigDecimal.ZERO) >= 0 && y
        .compareTo(x.add(r)) <= 0);
  }
}
