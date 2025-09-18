package com.bananachat.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "group_messages")
public class GroupMessage {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 2000)
  private String content;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private MessageType type;

  @Column(nullable = false)
  private LocalDateTime timestamp;

  @Column(nullable = false)
  private Boolean isEdited = false;

  @Column
  private LocalDateTime editedAt;

  // Relacionamentos
  @ManyToOne
  @JoinColumn(name = "sender_id", nullable = false)
  private User sender;

  @ManyToOne
  @JoinColumn(name = "group_id", nullable = false)
  private Group group;

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

  // Construtores
  public GroupMessage() {
    this.timestamp = LocalDateTime.now();
  }

  public GroupMessage(String content, User sender, Group group, MessageType type) {
    this();
    this.content = content;
    this.sender = sender;
    this.group = group;
    this.type = type;
  }

  // Getters e Setters
  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getContent() {
    return content;
  }

  public void setContent(String content) {
    this.content = content;
    if (this.id != null) { // Só marca como editado se já existe no banco
      this.isEdited = true;
      this.editedAt = LocalDateTime.now();
    }
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

  public Boolean getIsEdited() {
    return isEdited;
  }

  public void setIsEdited(Boolean isEdited) {
    this.isEdited = isEdited;
  }

  public LocalDateTime getEditedAt() {
    return editedAt;
  }

  public void setEditedAt(LocalDateTime editedAt) {
    this.editedAt = editedAt;
  }

  public User getSender() {
    return sender;
  }

  public void setSender(User sender) {
    this.sender = sender;
  }

  public Group getGroup() {
    return group;
  }

  public void setGroup(Group group) {
    this.group = group;
  }

  // Métodos utilitários
  public boolean canBeEditedBy(User user) {
    return this.sender.equals(user) && this.type == MessageType.CHAT;
  }

  public boolean isSystemMessage() {
    return this.type != MessageType.CHAT;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o)
      return true;
    if (!(o instanceof GroupMessage))
      return false;
    GroupMessage that = (GroupMessage) o;
    return id != null && id.equals(that.id);
  }

  @Override
  public int hashCode() {
    return getClass().hashCode();
  }

  @Override
  public String toString() {
    return "GroupMessage{" +
        "id=" + id +
        ", content='" + content + '\'' +
        ", type=" + type +
        ", sender=" + (sender != null ? sender.getUsername() : null) +
        ", group=" + (group != null ? group.getName() : null) +
        ", timestamp=" + timestamp +
        ", isEdited=" + isEdited +
        '}';
  }
}