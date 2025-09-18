package com.bananachat.backend.entity;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "groups")
public class Group {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 100)
  private String name;

  @Column(length = 500)
  private String description;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private GroupType type = GroupType.PUBLIC;

  @Column(nullable = false)
  private Integer maxMembers = 100;

  @Column(nullable = false)
  private Boolean isActive = true;

  @Column(nullable = false)
  private LocalDateTime createdAt;

  @Column(nullable = false)
  private LocalDateTime updatedAt;

  // Relacionamentos
  @ManyToOne
  @JoinColumn(name = "owner_id", nullable = false)
  private User owner;

  @ManyToMany(mappedBy = "groups")
  private Set<User> members = new HashSet<>();

  @OneToMany(mappedBy = "group")
  private Set<GroupMessage> messages = new HashSet<>();

  public enum GroupType {
    PUBLIC, // Qualquer um pode entrar
    PRIVATE, // Apenas por convite
    RESTRICTED // Aprovação do administrador necessária
  }

  // Construtores
  public Group() {
    this.createdAt = LocalDateTime.now();
    this.updatedAt = LocalDateTime.now();
  }

  public Group(String name, User owner) {
    this();
    this.name = name;
    this.owner = owner;
    // Adiciona o dono como membro automaticamente
    this.members.add(owner);
  }

  public Group(String name, String description, User owner, GroupType type) {
    this();
    this.name = name;
    this.description = description;
    this.owner = owner;
    this.type = type;
    // Adiciona o dono como membro automaticamente
    this.members.add(owner);
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
    this.updatedAt = LocalDateTime.now();
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
    this.updatedAt = LocalDateTime.now();
  }

  public GroupType getType() {
    return type;
  }

  public void setType(GroupType type) {
    this.type = type;
    this.updatedAt = LocalDateTime.now();
  }

  public Integer getMaxMembers() {
    return maxMembers;
  }

  public void setMaxMembers(Integer maxMembers) {
    this.maxMembers = maxMembers;
    this.updatedAt = LocalDateTime.now();
  }

  public Boolean getIsActive() {
    return isActive;
  }

  public void setIsActive(Boolean isActive) {
    this.isActive = isActive;
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

  public User getOwner() {
    return owner;
  }

  public void setOwner(User owner) {
    this.owner = owner;
    this.updatedAt = LocalDateTime.now();
  }

  public Set<User> getMembers() {
    return members;
  }

  public void setMembers(Set<User> members) {
    this.members = members;
  }

  public Set<GroupMessage> getMessages() {
    return messages;
  }

  public void setMessages(Set<GroupMessage> messages) {
    this.messages = messages;
  }

  // Métodos utilitários
  public void addMember(User user) {
    if (this.members.size() < this.maxMembers) {
      this.members.add(user);
      user.getGroups().add(this);
      this.updatedAt = LocalDateTime.now();
    } else {
      throw new IllegalStateException("Grupo está lotado. Máximo de " + this.maxMembers + " membros.");
    }
  }

  public void removeMember(User user) {
    this.members.remove(user);
    user.getGroups().remove(this);
    this.updatedAt = LocalDateTime.now();
  }

  public boolean isMember(User user) {
    return this.members.contains(user);
  }

  public boolean isOwner(User user) {
    return this.owner.equals(user);
  }

  public boolean canJoin() {
    return this.isActive && this.members.size() < this.maxMembers;
  }

  public int getMemberCount() {
    return this.members.size();
  }

  @Override
  public boolean equals(Object o) {
    if (this == o)
      return true;
    if (!(o instanceof Group))
      return false;
    Group group = (Group) o;
    return id != null && id.equals(group.id);
  }

  @Override
  public int hashCode() {
    return getClass().hashCode();
  }

  @Override
  public String toString() {
    return "Group{" +
        "id=" + id +
        ", name='" + name + '\'' +
        ", type=" + type +
        ", memberCount=" + getMemberCount() +
        ", maxMembers=" + maxMembers +
        ", isActive=" + isActive +
        ", createdAt=" + createdAt +
        '}';
  }
}