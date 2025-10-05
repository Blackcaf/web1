package com.nlshakal;

import java.math.BigDecimal;

public class ShapeEndpointHandler {

  public boolean handleCircle(BigDecimal x, BigDecimal y, BigDecimal r) {
    if (x.compareTo(BigDecimal.ZERO) > 0 || y.compareTo(BigDecimal.ZERO) > 0) {
      return false;
    }

    BigDecimal halfR = r.divide(new BigDecimal("2"));
    BigDecimal radiusSquared = halfR.multiply(halfR);
    BigDecimal distanceSquared = x.multiply(x).add(y.multiply(y));

    return distanceSquared.compareTo(radiusSquared) <= 0;
  }

  public boolean handleRectangle(BigDecimal x, BigDecimal y, BigDecimal r) {
    BigDecimal halfR = r.divide(new BigDecimal("2"));
    return (x.compareTo(halfR.negate()) >= 0 &&
        x.compareTo(BigDecimal.ZERO) <= 0 &&
        y.compareTo(BigDecimal.ZERO) >= 0 &&
        y.compareTo(r) <= 0);
  }

  public boolean handleTriangle(BigDecimal x, BigDecimal y, BigDecimal r) {
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