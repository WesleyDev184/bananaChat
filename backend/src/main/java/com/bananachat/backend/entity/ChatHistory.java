package com.bananachat.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "chat_history")
public class ChatHistory {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String sender;

  @Column(nullable = false, length = 1000)
  private String content;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private MessageType type;

  @Column(nullable = false)
  private LocalDateTime timestamp;

  public enum MessageType {
    CHAT,
    JOIN,
    LEAVE
  }

  // Construtores
  public ChatHistory() {
    this.timestamp = LocalDateTime.now();
  }

  public ChatHistory(String sender, String content, MessageType type) {
    this();
    this.sender = sender;
    this.content = content;
    this.type = type;
  }

  // Getters e Setters
  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

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

  public MessageType getType() {
    return type;
  }

  public void setType(MessageType type) {
    this.type = type;
  }

  public LocalDateTime getTimestamp() {
    return timestamp;
  }

  public void setTimestamp(LocalDateTime timestamp) {
    this.timestamp = timestamp;
  }
}
