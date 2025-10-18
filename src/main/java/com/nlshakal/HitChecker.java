package com.nlshakal;

import java.math.BigDecimal;

public class HitChecker {
  public boolean isHit(BigDecimal x, BigDecimal y, BigDecimal r) {
    return checkRectangle(x, y, r) || checkCircle(x, y, r) || checkTriangle(x, y, r);
  }

  public boolean isCircleHit(BigDecimal x, BigDecimal y, BigDecimal r) { return checkCircle(x, y, r); }
  public boolean isRectangleHit(BigDecimal x, BigDecimal y, BigDecimal r) { return checkRectangle(x, y, r); }
  public boolean isTriangleHit(BigDecimal x, BigDecimal y, BigDecimal r) { return checkTriangle(x, y, r); }

  private boolean checkRectangle(BigDecimal x, BigDecimal y, BigDecimal r) {
    BigDecimal halfR = r.divide(new BigDecimal("2"));
    return x.compareTo(halfR.negate()) >= 0 && x.compareTo(BigDecimal.ZERO) <= 0 &&
        y.compareTo(BigDecimal.ZERO) >= 0 && y.compareTo(r) <= 0;
  }

  private boolean checkCircle(BigDecimal x, BigDecimal y, BigDecimal r) {
    if (x.compareTo(BigDecimal.ZERO) > 0 || y.compareTo(BigDecimal.ZERO) > 0) return false;
    BigDecimal halfR = r.divide(new BigDecimal("2"));
    return x.multiply(x).add(y.multiply(y)).compareTo(halfR.multiply(halfR)) <= 0;
  }

  private boolean checkTriangle(BigDecimal x, BigDecimal y, BigDecimal r) {
    if (x.compareTo(BigDecimal.ZERO) < 0 || y.compareTo(BigDecimal.ZERO) > 0) return false;
    BigDecimal halfR = r.divide(new BigDecimal("2"));
    return x.compareTo(halfR) <= 0 && y.compareTo(r.negate()) >= 0 &&
        y.subtract(new BigDecimal("2").multiply(x)).add(r).compareTo(BigDecimal.ZERO) >= 0;
  }
}