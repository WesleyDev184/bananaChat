package com.bananachat.backend.controller;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bananachat.backend.controller.UserController.ErrorResponse;
import com.bananachat.backend.controller.UserController.MessageResponse;
import com.bananachat.backend.dto.GroupMessageDto;
import com.bananachat.backend.service.GroupMessageService;

@RestController
@RequestMapping("/api/groups/{groupId}/messages")
@CrossOrigin(origins = "http://localhost:3000")
public class GroupMessageController {

  private static final Logger LOGGER = LoggerFactory.getLogger(GroupMessageController.class);

  @Autowired
  private GroupMessageService groupMessageService;

  /**
   * Buscar histórico de mensagens do grupo
   */
  @GetMapping
  public ResponseEntity<?> getGroupHistory(@PathVariable Long groupId, @RequestParam String username) {
    try {
      List<GroupMessageDto> messages = groupMessageService.getGroupHistory(groupId, username);
      return ResponseEntity.ok(messages);
    } catch (IllegalArgumentException e) {
      LOGGER.warn("Erro ao buscar histórico do grupo ID {}: {}", groupId, e.getMessage());
      return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
    } catch (Exception e) {
      LOGGER.error("Erro interno ao buscar histórico do grupo ID: {}", groupId, e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(new ErrorResponse("Erro interno do servidor"));
    }
  }

  /**
   * Buscar mensagens recentes do grupo
   */
  @GetMapping("/recent")
  public ResponseEntity<?> getRecentGroupMessages(@PathVariable Long groupId, @RequestParam String username,
      @RequestParam(defaultValue = "50") int limit) {
    try {
      List<GroupMessageDto> messages = groupMessageService.getRecentGroupMessages(groupId, username, limit);
      return ResponseEntity.ok(messages);
    } catch (IllegalArgumentException e) {
      LOGGER.warn("Erro ao buscar mensagens recentes do grupo ID {}: {}", groupId, e.getMessage());
      return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
    } catch (Exception e) {
      LOGGER.error("Erro interno ao buscar mensagens recentes do grupo ID: {}", groupId, e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(new ErrorResponse("Erro interno do servidor"));
    }
  }

  /**
   * Buscar mensagens desde uma data específica
   */
  @GetMapping("/since")
  public ResponseEntity<?> getGroupMessagesSince(@PathVariable Long groupId, @RequestParam String username,
      @RequestParam String since) {
    try {
      // Parsear a data
      LocalDateTime sinceDate = LocalDateTime.parse(since, DateTimeFormatter.ISO_LOCAL_DATE_TIME);

      List<GroupMessageDto> messages = groupMessageService.getGroupMessagesSince(groupId, username, sinceDate);
      return ResponseEntity.ok(messages);
    } catch (IllegalArgumentException e) {
      LOGGER.warn("Erro ao buscar mensagens do grupo ID {} desde {}: {}", groupId, since, e.getMessage());
      return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
    } catch (Exception e) {
      LOGGER.error("Erro interno ao buscar mensagens do grupo ID {} desde {}: {}", groupId, since, e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(new ErrorResponse("Erro interno do servidor"));
    }
  }

  /**
   * Buscar mensagens no grupo por termo de pesquisa
   */
  @GetMapping("/search")
  public ResponseEntity<?> searchMessagesInGroup(@PathVariable Long groupId, @RequestParam String username,
      @RequestParam String query) {
    try {
      List<GroupMessageDto> messages = groupMessageService.searchMessagesInGroup(groupId, username, query);
      return ResponseEntity.ok(messages);
    } catch (IllegalArgumentException e) {
      LOGGER.warn("Erro ao buscar mensagens no grupo ID {} com query {}: {}", groupId, query, e.getMessage());
      return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
    } catch (Exception e) {
      LOGGER.error("Erro interno ao buscar mensagens no grupo ID {} com query {}: {}", groupId, query, e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(new ErrorResponse("Erro interno do servidor"));
    }
  }

  /**
   * Editar mensagem
   */
  @PutMapping("/{messageId}")
  public ResponseEntity<?> editMessage(@PathVariable Long groupId, @PathVariable Long messageId,
      @RequestBody EditMessageRequest request, @RequestParam String username) {
    try {
      GroupMessageDto message = groupMessageService.editMessage(messageId, request.getContent(), username);
      return ResponseEntity.ok(message);
    } catch (IllegalArgumentException e) {
      LOGGER.warn("Erro ao editar mensagem ID {} no grupo {}: {}", messageId, groupId, e.getMessage());
      return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
    } catch (Exception e) {
      LOGGER.error("Erro interno ao editar mensagem ID {} no grupo {}: {}", messageId, groupId, e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(new ErrorResponse("Erro interno do servidor"));
    }
  }

  /**
   * Deletar mensagem
   */
  @DeleteMapping("/{messageId}")
  public ResponseEntity<?> deleteMessage(@PathVariable Long groupId, @PathVariable Long messageId,
      @RequestParam String username) {
    try {
      groupMessageService.deleteMessage(messageId, username);
      return ResponseEntity.ok(new MessageResponse("Mensagem deletada com sucesso"));
    } catch (IllegalArgumentException e) {
      LOGGER.warn("Erro ao deletar mensagem ID {} no grupo {}: {}", messageId, groupId, e.getMessage());
      return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
    } catch (Exception e) {
      LOGGER.error("Erro interno ao deletar mensagem ID {} no grupo {}: {}", messageId, groupId, e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(new ErrorResponse("Erro interno do servidor"));
    }
  }

  /**
   * Contar mensagens do grupo
   */
  @GetMapping("/count")
  public ResponseEntity<?> countGroupMessages(@PathVariable Long groupId) {
    try {
      long count = groupMessageService.countGroupMessages(groupId);
      return ResponseEntity.ok(new CountResponse(count));
    } catch (Exception e) {
      LOGGER.error("Erro ao contar mensagens do grupo ID: {}", groupId, e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(new ErrorResponse("Erro interno do servidor"));
    }
  }

  // Classes para requests e responses
  public static class EditMessageRequest {
    private String content;

    public String getContent() {
      return content;
    }

    public void setContent(String content) {
      this.content = content;
    }
  }

  public static class CountResponse {
    private long count;

    public CountResponse(long count) {
      this.count = count;
    }

    public long getCount() {
      return count;
    }

    public void setCount(long count) {
      this.count = count;
    }
  }
}