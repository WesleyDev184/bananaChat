package com.bananachat.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.bananachat.backend.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

  Optional<User> findByUsername(String username);

  Optional<User> findByEmail(String email);

  boolean existsByUsername(String username);

  boolean existsByEmail(String email);

  @Query("SELECT u FROM User u WHERE u.isOnline = true ORDER BY u.username")
  java.util.List<User> findOnlineUsers();

  @Query("SELECT COUNT(u) FROM User u WHERE u.isOnline = true")
  long countOnlineUsers();

  @Query("SELECT u FROM User u WHERE u.username LIKE %:query% OR u.displayName LIKE %:query% ORDER BY u.username")
  java.util.List<User> searchUsers(@Param("query") String query);
}