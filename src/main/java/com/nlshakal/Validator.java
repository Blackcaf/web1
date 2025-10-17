package com.nlshakal;

import java.math.BigDecimal;

public class Validator {
  public void validate(BigDecimal x, BigDecimal y, BigDecimal r) {
    if (x == null || y == null || r == null) {
      throw new IllegalArgumentException("X, Y, R не могут быть null");
    }

    if (x.compareTo(Const.X_MIN) < 0 || x.compareTo(Const.X_MAX) > 0) {
      throw new IllegalArgumentException("X должен быть в диапазоне [-2; 2]");
    }

    if (y.compareTo(Const.Y_MIN) <= 0 || y.compareTo(Const.Y_MAX) >= 0) {
      throw new IllegalArgumentException("Y должен быть в интервале (-3; 5)");
    }

    if (r.compareTo(Const.R_MIN) < 0 || r.compareTo(Const.R_MAX) > 0) {
      throw new IllegalArgumentException("R должен быть в диапазоне [1; 3]");
    }
  }
}