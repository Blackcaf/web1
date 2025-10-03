package com.nlshakal;

import java.math.BigDecimal;

public interface PointValidator {
  void validate(BigDecimal x, BigDecimal y, BigDecimal r);
  boolean isHit(BigDecimal x, BigDecimal y, BigDecimal r);
}