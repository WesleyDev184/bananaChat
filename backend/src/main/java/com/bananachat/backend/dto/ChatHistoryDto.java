package com.bananachat.backend.dto;

import java.time.LocalDateTime;

public class ChatHistoryDto {
  private String sender;
  private String content;
  private String type;
  private LocalDateTime timestamp;

  // Construtores
  public ChatHistoryDto() {
  }

  public ChatHistoryDto(String sender, String content, String type, LocalDateTime timestamp) {
    this.sender = sender;
    this.content = content;
    this.type = type;
    this.timestamp = timestamp;
  }

  // Getters e Setters
  public String getSender() {
    return sender;
  }

  public void setSender(String sender) {
    this.sender = sender;
  }

  public String getContent() {
    return content;
  }

  public void setContent(String content) {
    this.content = content;
  }

  public String getType() {
    return type;
  }

  public void setType(String type) {
    this.type = type;
  }

  public LocalDateTime getTimestamp() {
    return timestamp;
  }

  public void setTimestamp(LocalDateTime timestamp) {
    this.timestamp = timestamp;
  }
}
