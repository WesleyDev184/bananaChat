package com.bananachat.backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bananachat.backend.dto.GroupMessageDto;
import com.bananachat.backend.entity.Group;
import com.bananachat.backend.entity.GroupMessage;
import com.bananachat.backend.entity.User;
import com.bananachat.backend.repository.GroupMessageRepository;
import com.bananachat.backend.repository.GroupRepository;
import com.bananachat.backend.repository.UserRepository;

@Service
@Transactional
public class GroupMessageService {

  private static final Logger LOGGER = LoggerFactory.getLogger(GroupMessageService.class);

  @Autowired
  private GroupMessageRepository groupMessageRepository;

  @Autowired
  private GroupRepository groupRepository;

  @Autowired
  private UserRepository userRepository;

  /**
   * Salva uma mensagem do grupo
   */
  public GroupMessageDto saveMessage(String content, String senderUsername, Long groupId,
      GroupMessage.MessageType type) {
    LOGGER.info("Salvando mensagem do grupo ID: {} pelo usuário: {}", groupId, senderUsername);

    // Buscar o grupo
    Group group = groupRepository.findByIdAndIsActiveTrue(groupId)
        .orElseThrow(() -> new IllegalArgumentException("Grupo não encontrado: " + groupId));

    // Buscar o usuário
    User sender = userRepository.findByUsername(senderUsername)
        .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado: " + senderUsername));

    // Verificar se o usuário é membro do grupo (exceto para mensagens do sistema)
    if (type == GroupMessage.MessageType.CHAT && !group.isMember(sender)) {
      throw new IllegalArgumentException("Usuário não é membro do grupo");
    }

    // Criar a mensagem
    GroupMessage message = new GroupMessage(content, sender, group, type);
    GroupMessage savedMessage = groupMessageRepository.save(message);

    LOGGER.info("Mensagem salva com sucesso no grupo: {} (ID: {})", group.getName(), savedMessage.getId());

    return new GroupMessageDto(savedMessage);
  }

  /**
   * Busca histórico de mensagens do grupo
   */
  @Transactional(readOnly = true)
  public List<GroupMessageDto> getGroupHistory(Long groupId, String username) {
    LOGGER.info("Buscando histórico do grupo ID: {} para usuário: {}", groupId, username);

    // Verificar se o grupo existe
    Group group = groupRepository.findByIdAndIsActiveTrue(groupId)
        .orElseThrow(() -> new IllegalArgumentException("Grupo não encontrado: " + groupId));

    // Verificar se o usuário é membro do grupo
    User user = userRepository.findByUsername(username)
        .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado: " + username));

    if (!group.isMember(user)) {
      throw new IllegalArgumentException("Usuário não é membro do grupo");
    }

    // Buscar mensagens do grupo
    return groupMessageRepository.findByGroupOrderByTimestampAsc(group)
        .stream()
        .map(GroupMessageDto::new)
        .toList();
  }

  /**
   * Busca mensagens recentes do grupo
   */
  @Transactional(readOnly = true)
  public List<GroupMessageDto> getRecentGroupMessages(Long groupId, String username, int limit) {
    LOGGER.info("Buscando {} mensagens recentes do grupo ID: {} para usuário: {}", limit, groupId, username);

    // Verificar se o grupo existe
    Group group = groupRepository.findByIdAndIsActiveTrue(groupId)
        .orElseThrow(() -> new IllegalArgumentException("Grupo não encontrado: " + groupId));

    // Verificar se o usuário é membro do grupo
    User user = userRepository.findByUsername(username)
        .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado: " + username));

    if (!group.isMember(user)) {
      throw new IllegalArgumentException("Usuário não é membro do grupo");
    }

    // Buscar mensagens recentes
    Pageable pageable = PageRequest.of(0, limit);
    return groupMessageRepository.findByGroupOrderByTimestampDesc(group, pageable)
        .stream()
        .map(GroupMessageDto::new)
        .toList();
  }

  /**
   * Busca mensagens do grupo desde uma data específica
   */
  @Transactional(readOnly = true)
  public List<GroupMessageDto> getGroupMessagesSince(Long groupId, String username, LocalDateTime since) {
    LOGGER.info("Buscando mensagens do grupo ID: {} desde: {} para usuário: {}", groupId, since, username);

    // Verificar se o grupo existe
    Group group = groupRepository.findByIdAndIsActiveTrue(groupId)
        .orElseThrow(() -> new IllegalArgumentException("Grupo não encontrado: " + groupId));

    // Verificar se o usuário é membro do grupo
    User user = userRepository.findByUsername(username)
        .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado: " + username));

    if (!group.isMember(user)) {
      throw new IllegalArgumentException("Usuário não é membro do grupo");
    }

    // Buscar mensagens desde a data especificada
    return groupMessageRepository.findByGroupAndTimestampAfter(group, since)
        .stream()
        .map(GroupMessageDto::new)
        .toList();
  }

  /**
   * Edita uma mensagem do grupo
   */
  public GroupMessageDto editMessage(Long messageId, String newContent, String editorUsername) {
    LOGGER.info("Editando mensagem ID: {} pelo usuário: {}", messageId, editorUsername);

    // Buscar a mensagem
    GroupMessage message = groupMessageRepository.findById(messageId)
        .orElseThrow(() -> new IllegalArgumentException("Mensagem não encontrada: " + messageId));

    // Buscar o usuário editor
    User editor = userRepository.findByUsername(editorUsername)
        .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado: " + editorUsername));

    // Verificar se o usuário pode editar a mensagem
    if (!message.canBeEditedBy(editor)) {
      throw new IllegalArgumentException("Usuário não pode editar esta mensagem");
    }

    // Editar a mensagem
    message.setContent(newContent);
    GroupMessage updatedMessage = groupMessageRepository.save(message);

    LOGGER.info("Mensagem editada com sucesso: {}", messageId);

    return new GroupMessageDto(updatedMessage);
  }

  /**
   * Busca mensagens no grupo por termo de pesquisa
   */
  @Transactional(readOnly = true)
  public List<GroupMessageDto> searchMessagesInGroup(Long groupId, String username, String query) {
    LOGGER.info("Buscando mensagens no grupo ID: {} com termo: {} para usuário: {}", groupId, query, username);

    // Verificar se o grupo existe
    Group group = groupRepository.findByIdAndIsActiveTrue(groupId)
        .orElseThrow(() -> new IllegalArgumentException("Grupo não encontrado: " + groupId));

    // Verificar se o usuário é membro do grupo
    User user = userRepository.findByUsername(username)
        .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado: " + username));

    if (!group.isMember(user)) {
      throw new IllegalArgumentException("Usuário não é membro do grupo");
    }

    // Buscar mensagens com o termo de pesquisa
    return groupMessageRepository.searchMessagesInGroup(group, query)
        .stream()
        .map(GroupMessageDto::new)
        .toList();
  }

  /**
   * Conta mensagens do grupo
   */
  @Transactional(readOnly = true)
  public long countGroupMessages(Long groupId) {
    Group group = groupRepository.findByIdAndIsActiveTrue(groupId)
        .orElseThrow(() -> new IllegalArgumentException("Grupo não encontrado: " + groupId));

    return groupMessageRepository.countMessagesByGroup(group);
  }

  /**
   * Deleta uma mensagem (apenas o autor ou admin do grupo)
   */
  public void deleteMessage(Long messageId, String deleterUsername) {
    LOGGER.info("Deletando mensagem ID: {} pelo usuário: {}", messageId, deleterUsername);

    // Buscar a mensagem
    GroupMessage message = groupMessageRepository.findById(messageId)
        .orElseThrow(() -> new IllegalArgumentException("Mensagem não encontrada: " + messageId));

    // Buscar o usuário que está deletando
    User deleter = userRepository.findByUsername(deleterUsername)
        .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado: " + deleterUsername));

    // Verificar se o usuário pode deletar a mensagem
    boolean canDelete = message.getSender().equals(deleter) ||
        message.getGroup().isOwner(deleter);

    if (!canDelete) {
      throw new IllegalArgumentException("Usuário não pode deletar esta mensagem");
    }

    // Deletar a mensagem
    groupMessageRepository.delete(message);

    LOGGER.info("Mensagem deletada com sucesso: {}", messageId);
  }

  /**
   * Salva mensagem de sistema (join, leave, etc.)
   */
  public GroupMessageDto saveSystemMessage(String content, Long groupId, GroupMessage.MessageType type,
      String username) {
    LOGGER.info("Salvando mensagem de sistema no grupo ID: {} tipo: {}", groupId, type);

    // Buscar o grupo
    Group group = groupRepository.findByIdAndIsActiveTrue(groupId)
        .orElseThrow(() -> new IllegalArgumentException("Grupo não encontrado: " + groupId));

    // Para mensagens de sistema, usar o usuário se fornecido, senão usar o dono do
    // grupo
    User sender;
    if (username != null) {
      sender = userRepository.findByUsername(username)
          .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado: " + username));
    } else {
      sender = group.getOwner();
    }

    // Criar a mensagem do sistema
    GroupMessage message = new GroupMessage(content, sender, group, type);
    GroupMessage savedMessage = groupMessageRepository.save(message);

    LOGGER.info("Mensagem de sistema salva no grupo: {} (ID: {})", group.getName(), savedMessage.getId());

    return new GroupMessageDto(savedMessage);
  }
}