package com.bananachat.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.bananachat.backend.dto.ChatHistoryDto;
import com.bananachat.backend.entity.ChatHistory;
import com.bananachat.backend.model.ChatMessage;
import com.bananachat.backend.repository.ChatHistoryRepository;

@Service
public class ChatHistoryService {

  private static final Logger LOGGER = LoggerFactory.getLogger(ChatHistoryService.class);

  @Autowired
  private ChatHistoryRepository chatHistoryRepository;

  /**
   * Salva uma mensagem no histórico
   */
  public void saveMessage(ChatMessage chatMessage) {
    try {
      ChatHistory.MessageType historyType = convertMessageType(chatMessage.getType());
      ChatHistory chatHistory = new ChatHistory(
          chatMessage.getSender(),
          chatMessage.getRecipient(),
          chatMessage.getContent(),
          historyType);

      // Define o timestamp da mensagem se disponível
      if (chatMessage.getTimestamp() != null) {
        chatHistory.setTimestamp(chatMessage.getTimestamp());
      }

      ChatHistory savedMessage = chatHistoryRepository.save(chatHistory);

      // Log detalhado para debug
      if (chatMessage.getRecipient() != null) {
        LOGGER.info("💾 Mensagem PRIVADA salva no histórico: {} -> {}: {} (ID: {})",
            chatMessage.getSender(), chatMessage.getRecipient(),
            chatMessage.getContent(), savedMessage.getId());
      } else {
        LOGGER.info("💾 Mensagem PÚBLICA salva no histórico: {}: {} (ID: {})",
            chatMessage.getSender(), chatMessage.getContent(), savedMessage.getId());
      }
    } catch (Exception e) {
      LOGGER.error("❌ Erro ao salvar mensagem no histórico: ", e);
    }
  }

  /**
   * Busca o histórico completo de mensagens
   */
  public List<ChatHistoryDto> getChatHistory() {
    try {
      List<ChatHistory> history = chatHistoryRepository.findAllOrderByTimestampAsc();
      return history.stream()
          .map(this::convertToDto)
          .collect(Collectors.toList());
    } catch (Exception e) {
      LOGGER.error("Erro ao buscar histórico de mensagens: ", e);
      return List.of();
    }
  }

  /**
   * Busca as mensagens mais recentes com paginação
   */
  public List<ChatHistoryDto> getRecentMessages(int page, int size) {
    try {
      Pageable pageable = PageRequest.of(page, size);
      return chatHistoryRepository.findRecentMessages(pageable)
          .getContent()
          .stream()
          .map(this::convertToDto)
          .collect(Collectors.toList());
    } catch (Exception e) {
      LOGGER.error("Erro ao buscar mensagens recentes: ", e);
      return List.of();
    }
  }

  /**
   * Converte ChatHistory para ChatHistoryDto
   */
  private ChatHistoryDto convertToDto(ChatHistory chatHistory) {
    return new ChatHistoryDto(
        chatHistory.getSender(),
        chatHistory.getRecipient(),
        chatHistory.getContent(),
        chatHistory.getType().name(),
        chatHistory.getTimestamp());
  }

  /**
   * Converte MessageType do ChatMessage para MessageType do ChatHistory
   */
  private ChatHistory.MessageType convertMessageType(ChatMessage.MessageType messageType) {
    switch (messageType) {
      case CHAT:
        return ChatHistory.MessageType.CHAT;
      case JOIN:
        return ChatHistory.MessageType.JOIN;
      case LEAVE:
        return ChatHistory.MessageType.LEAVE;
      default:
        return ChatHistory.MessageType.CHAT;
    }
  }

  /**
   * Busca mensagens privadas entre dois usuários
   */
  public List<ChatHistoryDto> getPrivateMessages(String user1, String user2) {
    try {
      LOGGER.info("🔍 Buscando mensagens privadas entre: {} <-> {}", user1, user2);

      List<ChatHistory> privateMessages = chatHistoryRepository.findPrivateMessagesBetweenUsers(user1, user2);

      LOGGER.info("📊 Encontradas {} mensagens privadas entre {} e {}",
          privateMessages.size(), user1, user2);

      // Log detalhado das mensagens encontradas
      privateMessages.forEach(msg -> {
        LOGGER.debug("  📝 {} -> {}: {} ({})",
            msg.getSender(), msg.getRecipient(),
            msg.getContent().substring(0, Math.min(30, msg.getContent().length())),
            msg.getTimestamp());
      });

      return privateMessages.stream()
          .map(this::convertToDto)
          .collect(Collectors.toList());
    } catch (Exception e) {
      LOGGER.error("❌ Erro ao buscar mensagens privadas entre {} e {}: ", user1, user2, e);
      return List.of();
    }
  }

  /**
   * Busca histórico de mensagens públicas (sem recipient)
   */
  public List<ChatHistoryDto> getPublicChatHistory() {
    try {
      List<ChatHistory> history = chatHistoryRepository.findPublicMessagesOrderByTimestampAsc();
      return history.stream()
          .map(this::convertToDto)
          .collect(Collectors.toList());
    } catch (Exception e) {
      LOGGER.error("Erro ao buscar histórico público: ", e);
      return List.of();
    }
  }
}
