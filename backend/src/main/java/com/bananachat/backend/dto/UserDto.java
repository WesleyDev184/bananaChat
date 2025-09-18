package com.bananachat.backend.dto;

import java.time.LocalDateTime;

import com.bananachat.backend.entity.User;

public class UserDto {
  private Long id;
  private String username;
  private String email;
  private String displayName;
  private Boolean isOnline;
  private LocalDateTime lastSeen;
  private LocalDateTime createdAt;

  // Construtores
  public UserDto() {
  }

  public UserDto(User user) {
    this.id = user.getId();
    this.username = user.getUsername();
    this.email = user.getEmail();
    this.displayName = user.getDisplayName();
    this.isOnline = user.getIsOnline();
    this.lastSeen = user.getLastSeen();
    this.createdAt = user.getCreatedAt();
  }

  // Getters e Setters
  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getDisplayName() {
    return displayName;
  }

  public void setDisplayName(String displayName) {
    this.displayName = displayName;
  }

  public Boolean getIsOnline() {
    return isOnline;
  }

  public void setIsOnline(Boolean isOnline) {
    this.isOnline = isOnline;
  }

  public LocalDateTime getLastSeen() {
    return lastSeen;
  }

  public void setLastSeen(LocalDateTime lastSeen) {
    this.lastSeen = lastSeen;
  }

  public LocalDateTime getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(LocalDateTime createdAt) {
    this.createdAt = createdAt;
  }
}