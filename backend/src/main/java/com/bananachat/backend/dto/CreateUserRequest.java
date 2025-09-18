package com.bananachat.backend.dto;

public class CreateUserRequest {

  private String username;
  private String email;
  private String password;
  private String displayName;

  // Construtores
  public CreateUserRequest() {
  }

  public CreateUserRequest(String username, String email, String password) {
    this.username = username;
    this.email = email;
    this.password = password;
  }

  public CreateUserRequest(String username, String email, String password, String displayName) {
    this.username = username;
    this.email = email;
    this.password = password;
    this.displayName = displayName;
  }

  // Getters e Setters
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

  public String getPassword() {
    return password;
  }

  public void setPassword(String password) {
    this.password = password;
  }

  public String getDisplayName() {
    return displayName;
  }

  public void setDisplayName(String displayName) {
    this.displayName = displayName;
  }
}