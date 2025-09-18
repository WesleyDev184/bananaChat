package com.bananachat.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.bananachat.backend.entity.Group;
import com.bananachat.backend.entity.User;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {

  List<Group> findByIsActiveTrue();

  List<Group> findByOwner(User owner);

  @Query("SELECT g FROM Group g WHERE g.isActive = true AND g.type = 'PUBLIC' ORDER BY g.name")
  List<Group> findPublicGroups();

  @Query("SELECT g FROM Group g JOIN g.members m WHERE m = :user AND g.isActive = true ORDER BY g.name")
  List<Group> findUserGroups(@Param("user") User user);

  @Query("SELECT g FROM Group g WHERE g.name LIKE %:query% AND g.isActive = true AND g.type = 'PUBLIC' ORDER BY g.name")
  List<Group> searchPublicGroups(@Param("query") String query);

  Optional<Group> findByIdAndIsActiveTrue(Long id);

  @Query("SELECT COUNT(m) FROM Group g JOIN g.members m WHERE g.id = :groupId")
  int countGroupMembers(@Param("groupId") Long groupId);

  @Query("SELECT CASE WHEN COUNT(m) > 0 THEN true ELSE false END FROM Group g JOIN g.members m WHERE g.id = :groupId AND m.id = :userId")
  boolean isUserMemberOfGroup(@Param("groupId") Long groupId, @Param("userId") Long userId);

  boolean existsByName(String name);
}