package com.nlshakal;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

public class FastCGIOutputHandler implements OutputHandler {
  @Override
  public void send(String response) throws IOException {
    System.out.write(response.getBytes(StandardCharsets.UTF_8));
    System.out.flush();
  }
}