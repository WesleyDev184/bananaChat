package com.bananachat.backend.entity;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true, length = 50)
  private String username;

  @Column(nullable = false, unique = true, length = 100)
  private String email;

  @Column(nullable = false, length = 255)
  private String password;

  @Column(length = 100)
  private String displayName;

  @Column(nullable = false)
  private LocalDateTime createdAt;

  @Column(nullable = false)
  private LocalDateTime updatedAt;

  @Column(nullable = false)
  private Boolean isOnline = false;

  @Column
  private LocalDateTime lastSeen;

  // Relacionamentos
  @ManyToMany
  @JoinTable(name = "user_groups", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "group_id"))
  private Set<Group> groups = new HashSet<>();

  @OneToMany(mappedBy = "owner")
  private Set<Group> ownedGroups = new HashSet<>();

  // Construtores
  public User() {
    this.createdAt = LocalDateTime.now();
    this.updatedAt = LocalDateTime.now();
  }

  public User(String username, String email, String password) {
    this();
    this.username = username;
    this.email = email;
    this.password = password;
    this.displayName = username;
  }

  public User(String username, String email, String password, String displayName) {
    this();
    this.username = username;
    this.email = email;
    this.password = password;
    this.displayName = displayName;
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
    this.updatedAt = LocalDateTime.now();
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
    this.updatedAt = LocalDateTime.now();
  }

  public String getPassword() {
    return password;
  }

  public void setPassword(String password) {
    this.password = password;
    this.updatedAt = LocalDateTime.now();
  }

  public String getDisplayName() {
    return displayName;
  }

  public void setDisplayName(String displayName) {
    this.displayName = displayName;
    this.updatedAt = LocalDateTime.now();
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

  public Boolean getIsOnline() {
    return isOnline;
  }

  public void setIsOnline(Boolean isOnline) {
    this.isOnline = isOnline;
    this.updatedAt = LocalDateTime.now();
    if (isOnline) {
      this.lastSeen = LocalDateTime.now();
    }
  }

  public LocalDateTime getLastSeen() {
    return lastSeen;
  }

  public void setLastSeen(LocalDateTime lastSeen) {
    this.lastSeen = lastSeen;
  }

  public Set<Group> getGroups() {
    return groups;
  }

  public void setGroups(Set<Group> groups) {
    this.groups = groups;
  }

  public Set<Group> getOwnedGroups() {
    return ownedGroups;
  }

  public void setOwnedGroups(Set<Group> ownedGroups) {
    this.ownedGroups = ownedGroups;
  }

  // Métodos utilitários
  public void addGroup(Group group) {
    this.groups.add(group);
    group.getMembers().add(this);
  }

  public void removeGroup(Group group) {
    this.groups.remove(group);
    group.getMembers().remove(this);
  }

  @Override
  public boolean equals(Object o) {
    if (this == o)
      return true;
    if (!(o instanceof User))
      return false;
    User user = (User) o;
    return id != null && id.equals(user.id);
  }

  @Override
  public int hashCode() {
    return getClass().hashCode();
  }

  @Override
  public String toString() {
    return "User{" +
        "id=" + id +
        ", username='" + username + '\'' +
        ", email='" + email + '\'' +
        ", displayName='" + displayName + '\'' +
        ", isOnline=" + isOnline +
        ", createdAt=" + createdAt +
        '}';
  }
}