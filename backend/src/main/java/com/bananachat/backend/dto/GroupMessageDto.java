package com.bananachat.backend.dto;

import java.time.LocalDateTime;

import com.bananachat.backend.entity.GroupMessage;

public class GroupMessageDto {
  private Long id;
  private String content;
  private String type;
  private LocalDateTime timestamp;
  private Boolean isEdited;
  private LocalDateTime editedAt;
  private UserDto sender;
  private Long groupId;
  private String groupName;

  // Construtores
  public GroupMessageDto() {
  }

  public GroupMessageDto(GroupMessage message) {
    this.id = message.getId();
    this.content = message.getContent();
    this.type = message.getType().name();
    this.timestamp = message.getTimestamp();
    this.isEdited = message.getIsEdited();
    this.editedAt = message.getEditedAt();
    this.sender = new UserDto(message.getSender());
    this.groupId = message.getGroup().getId();
    this.groupName = message.getGroup().getName();
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

  public UserDto getSender() {
    return sender;
  }

  public void setSender(UserDto sender) {
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
}