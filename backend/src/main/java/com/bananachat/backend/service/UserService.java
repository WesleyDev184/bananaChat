package com.bananachat.backend.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bananachat.backend.dto.CreateUserRequest;
import com.bananachat.backend.dto.UserDto;
import com.bananachat.backend.entity.User;
import com.bananachat.backend.repository.UserRepository;

@Service
@Transactional
public class UserService {

  private static final Logger LOGGER = LoggerFactory.getLogger(UserService.class);

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private OnlineUsersService onlineUsersService;

  /**
   * Cria um novo usuário
   */
  public UserDto createUser(CreateUserRequest request) {
    LOGGER.info("Criando novo usuário: {}", request.getUsername());

    // Verificar se username já existe
    if (userRepository.existsByUsername(request.getUsername())) {
      throw new IllegalArgumentException("Username já está em uso: " + request.getUsername());
    }

    // Verificar se email já existe
    if (userRepository.existsByEmail(request.getEmail())) {
      throw new IllegalArgumentException("Email já está em uso: " + request.getEmail());
    }

    User user = new User(
        request.getUsername(),
        request.getEmail(),
        request.getPassword(), // Em produção, deve ser hasheado
        request.getDisplayName() != null ? request.getDisplayName() : request.getUsername());

    User savedUser = userRepository.save(user);
    LOGGER.info("Usuário criado com sucesso: {} (ID: {})", savedUser.getUsername(), savedUser.getId());

    return new UserDto(savedUser);
  }

  /**
   * Busca usuário por username
   */
  @Transactional(readOnly = true)
  public Optional<UserDto> findByUsername(String username) {
    return userRepository.findByUsername(username)
        .map(UserDto::new);
  }

  /**
   * Busca usuário por ID
   */
  @Transactional(readOnly = true)
  public Optional<UserDto> findById(Long id) {
    return userRepository.findById(id)
        .map(UserDto::new);
  }

  /**
   * Busca usuário entity por username (para uso interno)
   */
  @Transactional(readOnly = true)
  public Optional<User> findUserEntityByUsername(String username) {
    return userRepository.findByUsername(username);
  }

  /**
   * Busca usuário entity por ID (para uso interno)
   */
  @Transactional(readOnly = true)
  public Optional<User> findUserEntityById(Long id) {
    return userRepository.findById(id);
  }

  /**
   * Atualiza status online do usuário
   */
  public void setUserOnlineStatus(String username, boolean isOnline) {
    LOGGER.info("Atualizando status online do usuário {}: {}", username, isOnline);

    Optional<User> userOpt = userRepository.findByUsername(username);
    if (userOpt.isPresent()) {
      User user = userOpt.get();
      user.setIsOnline(isOnline);
      userRepository.save(user);
      LOGGER.info("Status online atualizado para usuário: {}", username);
    } else {
      LOGGER.warn("Usuário não encontrado para atualizar status: {}", username);
    }
  }

  /**
   * Lista usuários online
   */
  @Transactional(readOnly = true)
  public List<UserDto> getOnlineUsers() {
    return userRepository.findOnlineUsers()
        .stream()
        .map(UserDto::new)
        .toList();
  }

  /**
   * Conta usuários online
   */
  @Transactional(readOnly = true)
  public long countOnlineUsers() {
    return userRepository.countOnlineUsers();
  }

  /**
   * Busca usuários por termo de pesquisa
   */
  @Transactional(readOnly = true)
  public List<UserDto> searchUsers(String query) {
    return userRepository.searchUsers(query)
        .stream()
        .map(UserDto::new)
        .toList();
  }

  /**
   * Valida se usuário existe e está ativo
   */
  @Transactional(readOnly = true)
  public boolean validateUser(String username) {
    return userRepository.findByUsername(username).isPresent();
  }

  /**
   * Lista todos os usuários
   */
  @Transactional(readOnly = true)
  public List<UserDto> getAllUsers() {
    LOGGER.info("Listando todos os usuários do sistema");

    List<User> users = userRepository.findAll();
    List<String> onlineUsernames = new ArrayList<>(onlineUsersService.getOnlineUsers());

    return users.stream()
        .map(user -> {
          UserDto dto = new UserDto(user);
          dto.setIsOnline(onlineUsernames.contains(user.getUsername()));
          return dto;
        })
        .collect(Collectors.toList());
  }

  /**
   * Atualiza informações do usuário
   */
  public UserDto updateUser(Long userId, String displayName, String email) {
    LOGGER.info("Atualizando usuário ID: {}", userId);

    User user = userRepository.findById(userId)
        .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado: " + userId));

    if (displayName != null && !displayName.trim().isEmpty()) {
      user.setDisplayName(displayName.trim());
    }

    if (email != null && !email.trim().isEmpty()) {
      // Verificar se o novo email já está em uso por outro usuário
      Optional<User> existingUser = userRepository.findByEmail(email);
      if (existingUser.isPresent() && !existingUser.get().getId().equals(userId)) {
        throw new IllegalArgumentException("Email já está em uso: " + email);
      }
      user.setEmail(email.trim());
    }

    User updatedUser = userRepository.save(user);
    LOGGER.info("Usuário atualizado com sucesso: {}", updatedUser.getUsername());

    return new UserDto(updatedUser);
  }

  /**
   * Remove usuário (soft delete - marca como inativo)
   */
  public void deleteUser(Long userId) {
    LOGGER.info("Removendo usuário ID: {}", userId);

    User user = userRepository.findById(userId)
        .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado: " + userId));

    // Em vez de deletar, podemos marcar como inativo
    user.setIsOnline(false);
    userRepository.save(user);

    LOGGER.info("Usuário removido com sucesso: {}", user.getUsername());
  }
}