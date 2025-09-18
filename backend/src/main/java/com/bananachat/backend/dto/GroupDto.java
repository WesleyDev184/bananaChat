package com.bananachat.backend.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import com.bananachat.backend.entity.Group;

public class GroupDto {
  private Long id;
  private String name;
  private String description;
  private String type;
  private Integer maxMembers;
  private Integer memberCount;
  private Boolean isActive;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
  private UserDto owner;
  private List<UserDto> members;
  private Boolean isUserMember;
  private Boolean isUserOwner;

  // Construtores
  public GroupDto() {
  }

  public GroupDto(Group group) {
    this.id = group.getId();
    this.name = group.getName();
    this.description = group.getDescription();
    this.type = group.getType().name();
    this.maxMembers = group.getMaxMembers();
    this.memberCount = group.getMemberCount();
    this.isActive = group.getIsActive();
    this.createdAt = group.getCreatedAt();
    this.updatedAt = group.getUpdatedAt();
    this.owner = new UserDto(group.getOwner());
    this.members = group.getMembers().stream()
        .map(UserDto::new)
        .collect(Collectors.toList());
  }

  public GroupDto(Group group, Long currentUserId) {
    this(group);
    this.isUserMember = group.getMembers().stream()
        .anyMatch(member -> member.getId().equals(currentUserId));
    this.isUserOwner = group.getOwner().getId().equals(currentUserId);
  }

  // Getters e Setters
  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

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

  public Integer getMemberCount() {
    return memberCount;
  }

  public void setMemberCount(Integer memberCount) {
    this.memberCount = memberCount;
  }

  public Boolean getIsActive() {
    return isActive;
  }

  public void setIsActive(Boolean isActive) {
    this.isActive = isActive;
  }

  public LocalDateTime getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(LocalDateTime createdAt) {
    this.createdAt = createdAt;
  }

  public LocalDateTime getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(LocalDateTime updatedAt) {
    this.updatedAt = updatedAt;
  }

  public UserDto getOwner() {
    return owner;
  }

  public void setOwner(UserDto owner) {
    this.owner = owner;
  }

  public List<UserDto> getMembers() {
    return members;
  }

  public void setMembers(List<UserDto> members) {
    this.members = members;
  }

  public Boolean getIsUserMember() {
    return isUserMember;
  }

  public void setIsUserMember(Boolean isUserMember) {
    this.isUserMember = isUserMember;
  }

  public Boolean getIsUserOwner() {
    return isUserOwner;
  }

  public void setIsUserOwner(Boolean isUserOwner) {
    this.isUserOwner = isUserOwner;
  }
}