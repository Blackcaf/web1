package com.nlshakal;

import java.math.BigDecimal;

public class HitChecker {
  public boolean isHit(BigDecimal x, BigDecimal y, BigDecimal r) {
    return isRectangleHit(x, y, r) || isCircleHit(x, y, r) || isTriangleHit(x, y, r);
  }

  public boolean isCircleHit(BigDecimal x, BigDecimal y, BigDecimal r) {
    if (x.signum() > 0 || y.signum() > 0) return false;
    BigDecimal halfR = r.divide(new BigDecimal("2"));
    return x.multiply(x).add(y.multiply(y)).compareTo(halfR.multiply(halfR)) <= 0;
  }

  public boolean isRectangleHit(BigDecimal x, BigDecimal y, BigDecimal r) {
    return x.compareTo(r.divide(new BigDecimal("2")).negate()) >= 0 && x.signum() <= 0 && y.signum() >= 0 && y.compareTo(r) <= 0;
  }

  public boolean isTriangleHit(BigDecimal x, BigDecimal y, BigDecimal r) {
    return x.signum() >= 0 && y.signum() <= 0 && x.compareTo(r.divide(new BigDecimal("2"))) <= 0 && y.compareTo(r.negate()) >= 0 &&
        y.subtract(new BigDecimal("2").multiply(x)).add(r).signum() >= 0;
  }
}