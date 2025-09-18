package com.bananachat.backend.dto;

public class CreateGroupRequest {

  private String name;
  private String description;
  private String type = "PUBLIC"; // PUBLIC, PRIVATE, RESTRICTED
  private Integer maxMembers = 100;

  // Construtores
  public CreateGroupRequest() {
  }

  public CreateGroupRequest(String name, String description) {
    this.name = name;
    this.description = description;
  }

  public CreateGroupRequest(String name, String description, String type, Integer maxMembers) {
    this.name = name;
    this.description = description;
    this.type = type;
    this.maxMembers = maxMembers;
  }

  // Getters e Setters
  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public String getType() {
    return type;
  }

  public void setType(String type) {
    this.type = type;
  }

  public Integer getMaxMembers() {
    return maxMembers;
  }

  public void setMaxMembers(Integer maxMembers) {
    this.maxMembers = maxMembers;
  }
}