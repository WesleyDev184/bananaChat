package com.bananachat.backend.model;

import java.io.Serializable;
import java.time.LocalDateTime;

public class GroupChatMessage implements Serializable {
  private static final long serialVersionUID = 1L;

  private String content;
  private String sender;
  private Long groupId;
  private String groupName;
  private MessageType type;
  private LocalDateTime timestamp;

  public enum MessageType {
    CHAT, // Mensagem normal
    JOIN, // Usuário entrou no grupo
    LEAVE, // Usuário saiu do grupo
    GROUP_CREATED, // Grupo foi criado
    GROUP_UPDATED, // Grupo foi atualizado
    MEMBER_ADDED, // Membro foi adicionado
    MEMBER_REMOVED, // Membro foi removido
    SYSTEM // Mensagem do sistema
  }

  // Construtor padrão
  public GroupChatMessage() {
    this.timestamp = LocalDateTime.now();
  }

  // Construtor com parâmetros
  public GroupChatMessage(String content, String sender, Long groupId, MessageType type) {
    this();
    this.content = content;
    this.sender = sender;
    this.groupId = groupId;
    this.type = type;
  }

  // Construtor completo
  public GroupChatMessage(String content, String sender, Long groupId, String groupName, MessageType type) {
    this();
    this.content = content;
    this.sender = sender;
    this.groupId = groupId;
    this.groupName = groupName;
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

  public Long getGroupId() {
    return groupId;
  }

  public void setGroupId(Long groupId) {
    this.groupId = groupId;
  }

  public String getGroupName() {
    return groupName;
  }

  public void setGroupName(String groupName) {
    this.groupName = groupName;
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

  @Override
  public String toString() {
    return "GroupChatMessage{" +
        "content='" + content + '\'' +
        ", sender='" + sender + '\'' +
        ", groupId=" + groupId +
        ", groupName='" + groupName + '\'' +
        ", type=" + type +
        ", timestamp=" + timestamp +
        '}';
  }
}