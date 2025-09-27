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
    if (y.compareTo(Y_MIN) <= 0 || y.compareTo(Y_MAX) >= 0)
      throw new IllegalArgumentException("Y должен быть в диапазоне (-3; 5)");
    if (r.compareTo(R_MIN) < 0 || r.compareTo(R_MAX) > 0)
      throw new IllegalArgumentException("R должен быть в диапазоне [1; 3]");
  }

  public boolean isHit(BigDecimal x, BigDecimal y, BigDecimal r) {
    return (checkRectangle(x, y, r) || checkCircle(x, y, r) || checkTriangle(x, y, r));
  }

  // ОБЛАСТЬ 1: Прямоугольник во 2-м квадранте
  // X: от -R/2 до 0, Y: от 0 до R
  private boolean checkRectangle(BigDecimal x, BigDecimal y, BigDecimal r) {
    BigDecimal halfR = r.divide(new BigDecimal("2"));
    return (x.compareTo(halfR.negate()) >= 0 &&
        x.compareTo(BigDecimal.ZERO) <= 0 &&
        y.compareTo(BigDecimal.ZERO) >= 0 &&
        y.compareTo(r) <= 0);
  }

  // ОБЛАСТЬ 2: Четверть круга в 3-м квадранте (СЛЕВА СНИЗУ)
  // Радиус R/2, X <= 0, Y <= 0
  private boolean checkCircle(BigDecimal x, BigDecimal y, BigDecimal r) {
    if (x.compareTo(BigDecimal.ZERO) > 0 || y.compareTo(BigDecimal.ZERO) > 0) {
      return false;
    }

    BigDecimal halfR = r.divide(new BigDecimal("2"));
    BigDecimal radiusSquared = halfR.multiply(halfR);
    BigDecimal distanceSquared = x.multiply(x).add(y.multiply(y));

    return distanceSquared.compareTo(radiusSquared) <= 0;
  }

  // ОБЛАСТЬ 3: Треугольник в 4-м квадранте
  // X: от 0 до R/2, Y: от 0 до -R, ограничен линией x + y = R/2
  private boolean checkTriangle(BigDecimal x, BigDecimal y, BigDecimal r) {
    if (x.compareTo(BigDecimal.ZERO) < 0 || y.compareTo(BigDecimal.ZERO) > 0) {
      return false;
    }

    BigDecimal halfR = r.divide(new BigDecimal("2"));

    // Проверяем границы треугольника:
    // 1. x >= 0 (уже проверено выше)
    // 2. y <= 0 (уже проверено выше)
    // 3. x <= R/2
    // 4. y >= -R
    // 5. Линия треугольника: x - y <= R/2 (или x + |y| <= R/2, так как y <= 0)
    return (x.compareTo(halfR) <= 0 &&
        y.compareTo(r.negate()) >= 0 &&
        x.add(y.abs()).compareTo(halfR) <= 0);
  }
}