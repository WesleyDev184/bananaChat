package com.bananachat.backend.service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bananachat.backend.dto.CreateGroupRequest;
import com.bananachat.backend.dto.GroupDto;
import com.bananachat.backend.entity.Group;
import com.bananachat.backend.entity.User;
import com.bananachat.backend.repository.GroupRepository;
import com.bananachat.backend.repository.UserRepository;

@Service
@Transactional
public class GroupService {

  private static final Logger LOGGER = LoggerFactory.getLogger(GroupService.class);

  @Autowired
  private GroupRepository groupRepository;

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private SimpMessagingTemplate messagingTemplate;

  /**
   * Cria um novo grupo
   */
  public GroupDto createGroup(CreateGroupRequest request, String ownerUsername) {
    LOGGER.info("Criando novo grupo: {} pelo usuário: {}", request.getName(), ownerUsername);

    // Verificar se o nome do grupo já existe
    if (groupRepository.existsByName(request.getName())) {
      throw new IllegalArgumentException("Nome do grupo já está em uso: " + request.getName());
    }

    // Buscar o usuário proprietário
    User owner = userRepository.findByUsername(ownerUsername)
        .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado: " + ownerUsername));

    // Criar o grupo
    Group group = new Group(
        request.getName(),
        request.getDescription(),
        owner,
        Group.GroupType.valueOf(request.getType()));

    if (request.getMaxMembers() != null && request.getMaxMembers() > 0) {
      group.setMaxMembers(request.getMaxMembers());
    }

    Group savedGroup = groupRepository.save(group);

    // Adicionar o owner como membro do grupo explicitamente
    savedGroup.getMembers().add(owner);
    owner.getGroups().add(savedGroup);
    groupRepository.save(savedGroup);
    userRepository.save(owner);

    LOGGER.info("Grupo criado com sucesso: {} (ID: {})", savedGroup.getName(), savedGroup.getId());

    GroupDto groupDto = new GroupDto(savedGroup, owner.getId());

    // Notificar todos os usuários sobre o novo grupo via WebSocket
    try {
      messagingTemplate.convertAndSend("/topic/groups.update",
          Map.of("action", "GROUP_CREATED", "group", groupDto));
      LOGGER.info("Notificação de novo grupo enviada via WebSocket: {}", savedGroup.getName());
    } catch (Exception e) {
      LOGGER.error("Erro ao enviar notificação de novo grupo via WebSocket: ", e);
    }

    return groupDto;
  }

  /**
   * Lista todos os grupos públicos ativos
   */
  @Transactional(readOnly = true)
  public List<GroupDto> getPublicGroups() {
    return groupRepository.findPublicGroups()
        .stream()
        .map(GroupDto::new)
        .toList();
  }

  /**
   * Lista grupos do usuário
   */
  @Transactional(readOnly = true)
  public List<GroupDto> getUserGroups(String username) {
    User user = userRepository.findByUsername(username)
        .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado: " + username));

    return groupRepository.findUserGroups(user)
        .stream()
        .map(group -> new GroupDto(group, user.getId()))
        .toList();
  }

  /**
   * Busca grupo por ID
   */
  @Transactional(readOnly = true)
  public Optional<GroupDto> findById(Long groupId, String username) {
    User user = userRepository.findByUsername(username)
        .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado: " + username));

    return groupRepository.findByIdAndIsActiveTrue(groupId)
        .map(group -> new GroupDto(group, user.getId()));
  }

  /**
   * Busca grupo entity por ID (para uso interno)
   */
  @Transactional(readOnly = true)
  public Optional<Group> findGroupEntityById(Long groupId) {
    return groupRepository.findByIdAndIsActiveTrue(groupId);
  }

  /**
   * Adiciona usuário ao grupo
   */
  public GroupDto addUserToGroup(Long groupId, String username) {
    LOGGER.info("Adicionando usuário {} ao grupo ID: {}", username, groupId);

    Group group = groupRepository.findByIdAndIsActiveTrue(groupId)
        .orElseThrow(() -> new IllegalArgumentException("Grupo não encontrado: " + groupId));

    User user = userRepository.findByUsername(username)
        .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado: " + username));

    // Verificar se o grupo pode aceitar mais membros
    if (!group.canJoin()) {
      throw new IllegalStateException("Grupo não pode aceitar mais membros ou está inativo");
    }

    // Verificar se o usuário já é membro
    if (group.isMember(user)) {
      throw new IllegalArgumentException("Usuário já é membro do grupo");
    }

    // Adicionar o usuário ao grupo
    group.addMember(user);
    Group savedGroup = groupRepository.save(group);

    LOGGER.info("Usuário {} adicionado ao grupo {} com sucesso", username, group.getName());

    GroupDto groupDto = new GroupDto(savedGroup, user.getId());

    // Notificar todos os usuários sobre a mudança no grupo via WebSocket
    try {
      messagingTemplate.convertAndSend("/topic/groups.update",
          Map.of("action", "MEMBER_ADDED", "group", groupDto, "username", username));
      LOGGER.info("Notificação de membro adicionado enviada via WebSocket: {} em {}", username, group.getName());
    } catch (Exception e) {
      LOGGER.error("Erro ao enviar notificação de membro adicionado via WebSocket: ", e);
    }

    return groupDto;
  }

  /**
   * Remove usuário do grupo
   */
  public GroupDto removeUserFromGroup(Long groupId, String username) {
    LOGGER.info("Removendo usuário {} do grupo ID: {}", username, groupId);

    Group group = groupRepository.findByIdAndIsActiveTrue(groupId)
        .orElseThrow(() -> new IllegalArgumentException("Grupo não encontrado: " + groupId));

    User user = userRepository.findByUsername(username)
        .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado: " + username));

    // Verificar se o usuário é membro do grupo
    if (!group.isMember(user)) {
      throw new IllegalArgumentException("Usuário não é membro do grupo");
    }

    // Verificar se é o proprietário tentando sair
    if (group.isOwner(user)) {
      throw new IllegalArgumentException("Proprietário não pode sair do grupo. Transfira a propriedade primeiro.");
    }

    // Remover o usuário do grupo
    group.removeMember(user);
    Group savedGroup = groupRepository.save(group);

    LOGGER.info("Usuário {} removido do grupo {} com sucesso", username, group.getName());

    GroupDto groupDto = new GroupDto(savedGroup, user.getId());

    // Notificar todos os usuários sobre a mudança no grupo via WebSocket
    try {
      messagingTemplate.convertAndSend("/topic/groups.update",
          Map.of("action", "MEMBER_REMOVED", "group", groupDto, "username", username));
      LOGGER.info("Notificação de membro removido enviada via WebSocket: {} de {}", username, group.getName());
    } catch (Exception e) {
      LOGGER.error("Erro ao enviar notificação de membro removido via WebSocket: ", e);
    }

    return groupDto;
  }

  /**
   * Verifica se usuário é membro do grupo
   */
  @Transactional(readOnly = true)
  public boolean isUserMemberOfGroup(Long groupId, String username) {
    User user = userRepository.findByUsername(username)
        .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado: " + username));

    return groupRepository.isUserMemberOfGroup(groupId, user.getId());
  }

  /**
   * Busca grupos públicos por termo de pesquisa
   */
  @Transactional(readOnly = true)
  public List<GroupDto> searchPublicGroups(String query) {
    return groupRepository.searchPublicGroups(query)
        .stream()
        .map(GroupDto::new)
        .toList();
  }

  /**
   * Atualiza informações do grupo
   */
  public GroupDto updateGroup(Long groupId, String username, String name, String description, Integer maxMembers) {
    LOGGER.info("Atualizando grupo ID: {} pelo usuário: {}", groupId, username);

    Group group = groupRepository.findByIdAndIsActiveTrue(groupId)
        .orElseThrow(() -> new IllegalArgumentException("Grupo não encontrado: " + groupId));

    User user = userRepository.findByUsername(username)
        .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado: " + username));

    // Verificar se o usuário é o proprietário
    if (!group.isOwner(user)) {
      throw new IllegalArgumentException("Apenas o proprietário pode atualizar o grupo");
    }

    // Atualizar campos
    if (name != null && !name.trim().isEmpty()) {
      // Verificar se o novo nome já está em uso por outro grupo
      if (groupRepository.existsByName(name) && !group.getName().equals(name)) {
        throw new IllegalArgumentException("Nome do grupo já está em uso: " + name);
      }
      group.setName(name.trim());
    }

    if (description != null) {
      group.setDescription(description.trim());
    }

    if (maxMembers != null && maxMembers > 0) {
      // Verificar se o novo limite não é menor que o número atual de membros
      if (maxMembers < group.getMemberCount()) {
        throw new IllegalArgumentException("Não é possível reduzir o limite para menos que o número atual de membros");
      }
      group.setMaxMembers(maxMembers);
    }

    Group updatedGroup = groupRepository.save(group);
    LOGGER.info("Grupo atualizado com sucesso: {}", updatedGroup.getName());

    return new GroupDto(updatedGroup, user.getId());
  }

  /**
   * Desativa grupo (soft delete)
   */
  public void deleteGroup(Long groupId, String username) {
    LOGGER.info("Desativando grupo ID: {} pelo usuário: {}", groupId, username);

    Group group = groupRepository.findByIdAndIsActiveTrue(groupId)
        .orElseThrow(() -> new IllegalArgumentException("Grupo não encontrado: " + groupId));

    User user = userRepository.findByUsername(username)
        .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado: " + username));

    // Verificar se o usuário é o proprietário
    if (!group.isOwner(user)) {
      throw new IllegalArgumentException("Apenas o proprietário pode deletar o grupo");
    }

    // Marcar como inativo
    group.setIsActive(false);
    groupRepository.save(group);

    LOGGER.info("Grupo desativado com sucesso: {}", group.getName());
  }

  /**
   * Conta membros do grupo
   */
  @Transactional(readOnly = true)
  public int countGroupMembers(Long groupId) {
    return groupRepository.countGroupMembers(groupId);
  }
}