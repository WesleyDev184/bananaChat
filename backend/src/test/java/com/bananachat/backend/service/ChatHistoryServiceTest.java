package com.bananachat.backend.service;

import com.bananachat.backend.dto.ChatHistoryDto;
import com.bananachat.backend.entity.ChatHistory;
import com.bananachat.backend.model.ChatMessage;
import com.bananachat.backend.repository.ChatHistoryRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatHistoryServiceTest {

  @Mock
  private ChatHistoryRepository chatHistoryRepository;

  @InjectMocks
  private ChatHistoryService chatHistoryService;

  @Test
  void testSaveMessage() {
    // Arrange
    ChatMessage chatMessage = new ChatMessage();
    chatMessage.setSender("TestUser");
    chatMessage.setContent("Test message");
    chatMessage.setType(ChatMessage.MessageType.CHAT);

    when(chatHistoryRepository.save(any(ChatHistory.class))).thenReturn(new ChatHistory());

    // Act
    chatHistoryService.saveMessage(chatMessage);

    // Assert
    verify(chatHistoryRepository, times(1)).save(any(ChatHistory.class));
  }

  @Test
  void testGetChatHistory() {
    // Arrange
    ChatHistory history1 = new ChatHistory("User1", "Message 1", ChatHistory.MessageType.CHAT);
    ChatHistory history2 = new ChatHistory("User2", "Message 2", ChatHistory.MessageType.JOIN);

    when(chatHistoryRepository.findAllOrderByTimestampAsc())
        .thenReturn(Arrays.asList(history1, history2));

    // Act
    List<ChatHistoryDto> result = chatHistoryService.getChatHistory();

    // Assert
    assertEquals(2, result.size());
    assertEquals("User1", result.get(0).getSender());
    assertEquals("Message 1", result.get(0).getContent());
    assertEquals("CHAT", result.get(0).getType());
    verify(chatHistoryRepository, times(1)).findAllOrderByTimestampAsc();
  }
}
