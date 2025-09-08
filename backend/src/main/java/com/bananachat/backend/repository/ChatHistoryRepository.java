package com.bananachat.backend.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.bananachat.backend.entity.ChatHistory;

@Repository
public interface ChatHistoryRepository extends JpaRepository<ChatHistory, Long> {

  /**
   * Busca as mensagens mais recentes ordenadas por timestamp
   */
  @Query("SELECT c FROM ChatHistory c ORDER BY c.timestamp DESC")
  Page<ChatHistory> findRecentMessages(Pageable pageable);

  /**
   * Busca todas as mensagens ordenadas por timestamp (mais antigas primeiro)
   */
  @Query("SELECT c FROM ChatHistory c ORDER BY c.timestamp ASC")
  List<ChatHistory> findAllOrderByTimestampAsc();

  /**
   * Busca mensagens por tipo
   */
  List<ChatHistory> findByTypeOrderByTimestampAsc(ChatHistory.MessageType type);
}
