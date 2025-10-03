package com.nlshakal;

import java.math.BigDecimal;

public class HitChecker implements PointValidator {
  @Override
  public void validate(BigDecimal x, BigDecimal y, BigDecimal r) {
    // Пустая реализация, так как валидация выполняется в Validator
    throw new UnsupportedOperationException("Validation not supported by HitChecker");
  }

  @Override
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