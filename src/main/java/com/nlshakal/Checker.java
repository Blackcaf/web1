package com.nlshakal;

import java.math.BigDecimal;

public class Checker {
  private static final BigDecimal X_MIN = new BigDecimal("-2");
  private static final BigDecimal X_MAX = new BigDecimal("2");
  private static final BigDecimal Y_MIN = new BigDecimal("-3");
  private static final BigDecimal Y_MAX = new BigDecimal("5");
  private static final BigDecimal R_MIN = BigDecimal.ONE;
  private static final BigDecimal R_MAX = new BigDecimal("3");

  public void validate(BigDecimal x, BigDecimal y, BigDecimal r) {
    if (x.compareTo(X_MIN) < 0 || x.compareTo(X_MAX) > 0)
      throw new IllegalArgumentException("X должен быть в диапазоне [-2; 2]");

    BigDecimal yStripped = y.stripTrailingZeros();
    BigDecimal yMinStripped = Y_MIN.stripTrailingZeros();
    BigDecimal yMaxStripped = Y_MAX.stripTrailingZeros();

    if (yStripped.compareTo(yMinStripped) <= 0) {
      throw new IllegalArgumentException("Y должен быть в интервале (-3; 5)");
    }

    if (yStripped.compareTo(yMaxStripped) >= 0) {
      throw new IllegalArgumentException("Y должен быть в интервале (-3; 5)");
    }

    if (r.compareTo(R_MIN) < 0 || r.compareTo(R_MAX) > 0)
      throw new IllegalArgumentException("R должен быть в диапазоне [1; 3]");
  }

  public boolean isHit(BigDecimal x, BigDecimal y, BigDecimal r) {
    return (checkRectangle(x, y, r) || checkCircle(x, y, r) || checkTriangle(x, y, r));
  }

  private boolean checkRectangle(BigDecimal x, BigDecimal y, BigDecimal r) {
    BigDecimal halfR = r.divide(new BigDecimal("2"));
    return (x.compareTo(halfR.negate()) >= 0 &&
        x.compareTo(BigDecimal.ZERO) <= 0 &&
        y.compareTo(BigDecimal.ZERO) >= 0 &&
        y.compareTo(r) <= 0);
  }


  private boolean checkCircle(BigDecimal x, BigDecimal y, BigDecimal r) {
    if (x.compareTo(BigDecimal.ZERO) > 0 || y.compareTo(BigDecimal.ZERO) > 0) {
      return false;
    }

    BigDecimal halfR = r.divide(new BigDecimal("2"));
    BigDecimal radiusSquared = halfR.multiply(halfR);
    BigDecimal distanceSquared = x.multiply(x).add(y.multiply(y));

    return distanceSquared.compareTo(radiusSquared) <= 0;
  }

  private boolean checkTriangle(BigDecimal x, BigDecimal y, BigDecimal r) {
    if (x.compareTo(BigDecimal.ZERO) < 0 || y.compareTo(BigDecimal.ZERO) > 0) {
      return false;
    }

    BigDecimal halfR = r.divide(new BigDecimal("2"));

    BigDecimal two = new BigDecimal("2");
    BigDecimal lineCheck = y.subtract(two.multiply(x)).add(r);

    return (x.compareTo(halfR) <= 0 &&
        y.compareTo(r.negate()) >= 0 &&
        lineCheck.compareTo(BigDecimal.ZERO) >= 0);
  }
}