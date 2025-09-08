package com.bananachat.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bananachat.backend.dto.ChatHistoryDto;
import com.bananachat.backend.service.ChatHistoryService;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*") // Permite CORS para desenvolvimento
public class ChatHistoryController {

  @Autowired
  private ChatHistoryService chatHistoryService;

  /**
   * Endpoint para buscar todo o histórico de mensagens
   */
  @GetMapping("/history")
  public ResponseEntity<List<ChatHistoryDto>> getChatHistory() {
    List<ChatHistoryDto> history = chatHistoryService.getChatHistory();
    return ResponseEntity.ok(history);
  }

  /**
   * Endpoint para buscar mensagens recentes com paginação
   */
  @GetMapping("/history/recent")
  public ResponseEntity<List<ChatHistoryDto>> getRecentMessages(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "50") int size) {

    List<ChatHistoryDto> recentMessages = chatHistoryService.getRecentMessages(page, size);
    return ResponseEntity.ok(recentMessages);
  }
}
