package com.nlshakal;

import java.math.BigDecimal;

public interface PointValidator {
  boolean isHit(BigDecimal x, BigDecimal y, BigDecimal r);
}