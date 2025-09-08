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
          chatMessage.getContent(),
          historyType);

      chatHistoryRepository.save(chatHistory);
      LOGGER.info("Mensagem salva no histórico: {}", chatMessage.getContent());
    } catch (Exception e) {
      LOGGER.error("Erro ao salvar mensagem no histórico: ", e);
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
}
