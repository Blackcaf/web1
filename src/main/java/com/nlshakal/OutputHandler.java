package com.nlshakal;

import java.io.IOException;

public interface OutputHandler {
  void send(String response) throws IOException;
}