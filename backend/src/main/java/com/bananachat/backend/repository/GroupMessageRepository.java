package com.bananachat.backend.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.bananachat.backend.entity.Group;
import com.bananachat.backend.entity.GroupMessage;

@Repository
public interface GroupMessageRepository extends JpaRepository<GroupMessage, Long> {

  List<GroupMessage> findByGroupOrderByTimestampAsc(Group group);

  List<GroupMessage> findByGroupOrderByTimestampDesc(Group group, Pageable pageable);

  @Query("SELECT gm FROM GroupMessage gm WHERE gm.group = :group AND gm.timestamp >= :since ORDER BY gm.timestamp ASC")
  List<GroupMessage> findByGroupAndTimestampAfter(@Param("group") Group group, @Param("since") LocalDateTime since);

  @Query("SELECT gm FROM GroupMessage gm WHERE gm.group.id = :groupId ORDER BY gm.timestamp DESC")
  List<GroupMessage> findLatestGroupMessages(@Param("groupId") Long groupId, Pageable pageable);

  @Query("SELECT COUNT(gm) FROM GroupMessage gm WHERE gm.group = :group")
  long countMessagesByGroup(@Param("group") Group group);

  @Query("SELECT gm FROM GroupMessage gm WHERE gm.group = :group AND gm.content LIKE %:query% ORDER BY gm.timestamp DESC")
  List<GroupMessage> searchMessagesInGroup(@Param("group") Group group, @Param("query") String query);

  void deleteByGroup(Group group);
}