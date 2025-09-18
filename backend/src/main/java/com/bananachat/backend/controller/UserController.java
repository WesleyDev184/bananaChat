package com.bananachat.backend.controller;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bananachat.backend.dto.CreateUserRequest;
import com.bananachat.backend.dto.UserDto;
import com.bananachat.backend.service.UserService;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

  private static final Logger LOGGER = LoggerFactory.getLogger(UserController.class);

  @Autowired
  private UserService userService;

  /**
   * Criar novo usuário
   */
  @PostMapping("/register")
  public ResponseEntity<?> registerUser(@RequestBody CreateUserRequest request) {
    try {
      LOGGER.info("Recebida solicitação para criar usuário: {}", request.getUsername());

      UserDto user = userService.createUser(request);
      return ResponseEntity.status(HttpStatus.CREATED).body(user);

    } catch (IllegalArgumentException e) {
      LOGGER.warn("Erro ao criar usuário: {}", e.getMessage());
      return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
    } catch (Exception e) {
      LOGGER.error("Erro interno ao criar usuário", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(new ErrorResponse("Erro interno do servidor"));
    }
  }

  /**
   * Buscar usuário por username
   */
  @GetMapping("/username/{username}")
  public ResponseEntity<?> getUserByUsername(@PathVariable String username) {
    try {
      Optional<UserDto> user = userService.findByUsername(username);
      if (user.isPresent()) {
        return ResponseEntity.ok(user.get());
      } else {
        return ResponseEntity.notFound().build();
      }
    } catch (Exception e) {
      LOGGER.error("Erro ao buscar usuário por username: {}", username, e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(new ErrorResponse("Erro interno do servidor"));
    }
  }

  /**
   * Buscar usuário por ID
   */
  @GetMapping("/{id}")
  public ResponseEntity<?> getUserById(@PathVariable Long id) {
    try {
      Optional<UserDto> user = userService.findById(id);
      if (user.isPresent()) {
        return ResponseEntity.ok(user.get());
      } else {
        return ResponseEntity.notFound().build();
      }
    } catch (Exception e) {
      LOGGER.error("Erro ao buscar usuário por ID: {}", id, e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(new ErrorResponse("Erro interno do servidor"));
    }
  }

  /**
   * Listar usuários online (retorna UserDto com mais detalhes)
   */
  @GetMapping("/online/detailed")
  public ResponseEntity<?> getOnlineUsersDetailed() {
    try {
      List<UserDto> onlineUsers = userService.getOnlineUsers();
      return ResponseEntity.ok(onlineUsers);
    } catch (Exception e) {
      LOGGER.error("Erro ao buscar usuários online detalhados", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(new ErrorResponse("Erro interno do servidor"));
    }
  }

  /**
   * Buscar usuários por termo de pesquisa
   */
  @GetMapping("/search")
  public ResponseEntity<?> searchUsers(@RequestParam String query) {
    try {
      List<UserDto> users = userService.searchUsers(query);
      return ResponseEntity.ok(users);
    } catch (Exception e) {
      LOGGER.error("Erro ao buscar usuários com query: {}", query, e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(new ErrorResponse("Erro interno do servidor"));
    }
  }

  /**
   * Listar todos os usuários
   */
  @GetMapping
  public ResponseEntity<?> getAllUsers() {
    try {
      List<UserDto> users = userService.getAllUsers();
      return ResponseEntity.ok(users);
    } catch (Exception e) {
      LOGGER.error("Erro ao buscar todos os usuários", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(new ErrorResponse("Erro interno do servidor"));
    }
  }

  /**
   * Atualizar status online do usuário
   */
  @PutMapping("/{username}/online")
  public ResponseEntity<?> updateOnlineStatus(@PathVariable String username, @RequestParam boolean isOnline) {
    try {
      userService.setUserOnlineStatus(username, isOnline);
      return ResponseEntity.ok(new MessageResponse("Status atualizado com sucesso"));
    } catch (Exception e) {
      LOGGER.error("Erro ao atualizar status online do usuário: {}", username, e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(new ErrorResponse("Erro interno do servidor"));
    }
  }

  /**
   * Atualizar informações do usuário
   */
  @PutMapping("/{id}")
  public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody UpdateUserRequest request) {
    try {
      UserDto updatedUser = userService.updateUser(id, request.getDisplayName(), request.getEmail());
      return ResponseEntity.ok(updatedUser);
    } catch (IllegalArgumentException e) {
      LOGGER.warn("Erro ao atualizar usuário ID {}: {}", id, e.getMessage());
      return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
    } catch (Exception e) {
      LOGGER.error("Erro interno ao atualizar usuário ID: {}", id, e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(new ErrorResponse("Erro interno do servidor"));
    }
  }

  /**
   * Deletar usuário
   */
  @DeleteMapping("/{id}")
  public ResponseEntity<?> deleteUser(@PathVariable Long id) {
    try {
      userService.deleteUser(id);
      return ResponseEntity.ok(new MessageResponse("Usuário removido com sucesso"));
    } catch (IllegalArgumentException e) {
      LOGGER.warn("Erro ao deletar usuário ID {}: {}", id, e.getMessage());
      return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
    } catch (Exception e) {
      LOGGER.error("Erro interno ao deletar usuário ID: {}", id, e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(new ErrorResponse("Erro interno do servidor"));
    }
  }

  // Classes para respostas
  public static class ErrorResponse {
    private String error;

    public ErrorResponse(String error) {
      this.error = error;
    }

    public String getError() {
      return error;
    }

    public void setError(String error) {
      this.error = error;
    }
  }

  public static class MessageResponse {
    private String message;

    public MessageResponse(String message) {
      this.message = message;
    }

    public String getMessage() {
      return message;
    }

    public void setMessage(String message) {
      this.message = message;
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

  public static class UpdateUserRequest {
    private String displayName;
    private String email;

    public String getDisplayName() {
      return displayName;
    }

    public void setDisplayName(String displayName) {
      this.displayName = displayName;
    }

    public String getEmail() {
      return email;
    }

    public void setEmail(String email) {
      this.email = email;
    }
  }
}