package com.bananachat.backend.model;

import java.io.Serializable;
import java.time.LocalDateTime;

public class ChatMessage implements Serializable {
    private static final long serialVersionUID = 1L;

    private String content;
    private String sender;
    private MessageType type;
    private LocalDateTime timestamp;

    public enum MessageType {
        CHAT,
        JOIN,
        LEAVE
    }

    // Construtor padrão
    public ChatMessage() {
        this.timestamp = LocalDateTime.now();
    }

    // Construtor com parâmetros
    public ChatMessage(String content, String sender, MessageType type) {
        this();
        this.content = content;
        this.sender = sender;
        this.type = type;
    }

    // Getters e Setters
    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
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
