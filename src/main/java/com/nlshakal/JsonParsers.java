package com.nlshakal;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class JsonParsers implements RequestParser {
  private static final Pattern KEY_PATTERN = Pattern.compile("\"(\\w+)\"\\s*:");

  @Override
  public BigDecimal[] getBigDecimals(String requestString) {
    if (requestString == null || requestString.trim().isEmpty())
      throw new IllegalArgumentException("Пустое тело запроса");

    checkDuplicateKeys(requestString);
    JsonObject json = JsonParser.parseString(requestString).getAsJsonObject();

    if (json.size() != 3 || !json.has("x") || !json.has("y") || !json.has("r"))
      throw new IllegalArgumentException("Требуется ровно 3 параметра: x, y, r");

    return new BigDecimal[] { parseValue(json, "x"), parseValue(json, "y"), parseValue(json, "r") };
  }

  private void checkDuplicateKeys(String json) {
    Set<String> keys = new HashSet<>();
    Matcher matcher = KEY_PATTERN.matcher(json);
    while (matcher.find())
      if (!keys.add(matcher.group(1)))
        throw new IllegalArgumentException("Дублирующийся ключ: " + matcher.group(1));
  }

  private BigDecimal parseValue(JsonObject json, String key) {
    String value = json.get(key).getAsString().trim().replace(',', '.');
    if (!value.matches("^-?\\d*\\.?\\d+$") || value.length() > 100)
      throw new IllegalArgumentException(key + " должен быть числом (макс. 100 символов)");
    return new BigDecimal(value);
  }
}
