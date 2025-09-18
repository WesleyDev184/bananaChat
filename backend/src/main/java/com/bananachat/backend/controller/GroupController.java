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

import com.bananachat.backend.controller.UserController.ErrorResponse;
import com.bananachat.backend.controller.UserController.MessageResponse;
import com.bananachat.backend.dto.CreateGroupRequest;
import com.bananachat.backend.dto.GroupDto;
import com.bananachat.backend.service.GroupService;

@RestController
@RequestMapping("/api/groups")
@CrossOrigin(origins = "http://localhost:3000")
public class GroupController {

  private static final Logger LOGGER = LoggerFactory.getLogger(GroupController.class);

  @Autowired
  private GroupService groupService;

  /**
   * Criar novo grupo
   */
  @PostMapping
  public ResponseEntity<?> createGroup(@RequestBody CreateGroupRequest request, @RequestParam String owner) {
    try {
      LOGGER.info("Recebida solicitação para criar grupo: {} pelo usuário: {}", request.getName(), owner);

      GroupDto group = groupService.createGroup(request, owner);
      return ResponseEntity.status(HttpStatus.CREATED).body(group);

    } catch (IllegalArgumentException e) {
      LOGGER.warn("Erro ao criar grupo: {}", e.getMessage());
      return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
    } catch (Exception e) {
      LOGGER.error("Erro interno ao criar grupo", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(new ErrorResponse("Erro interno do servidor"));
    }
  }

  /**
   * Listar grupos públicos
   */
  @GetMapping("/public")
  public ResponseEntity<?> getPublicGroups() {
    try {
      List<GroupDto> groups = groupService.getPublicGroups();
      return ResponseEntity.ok(groups);
    } catch (Exception e) {
      LOGGER.error("Erro ao buscar grupos públicos", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(new ErrorResponse("Erro interno do servidor"));
    }
  }

  /**
   * Listar grupos do usuário
   */
  @GetMapping("/user/{username}")
  public ResponseEntity<?> getUserGroups(@PathVariable String username) {
    try {
      List<GroupDto> groups = groupService.getUserGroups(username);
      return ResponseEntity.ok(groups);
    } catch (IllegalArgumentException e) {
      LOGGER.warn("Erro ao buscar grupos do usuário {}: {}", username, e.getMessage());
      return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
    } catch (Exception e) {
      LOGGER.error("Erro interno ao buscar grupos do usuário: {}", username, e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(new ErrorResponse("Erro interno do servidor"));
    }
  }

  /**
   * Buscar grupo por ID
   */
  @GetMapping("/{id}")
  public ResponseEntity<?> getGroupById(@PathVariable Long id, @RequestParam String username) {
    try {
      Optional<GroupDto> group = groupService.findById(id, username);
      if (group.isPresent()) {
        return ResponseEntity.ok(group.get());
      } else {
        return ResponseEntity.notFound().build();
      }
    } catch (IllegalArgumentException e) {
      LOGGER.warn("Erro ao buscar grupo ID {}: {}", id, e.getMessage());
      return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
    } catch (Exception e) {
      LOGGER.error("Erro interno ao buscar grupo ID: {}", id, e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(new ErrorResponse("Erro interno do servidor"));
    }
  }

  /**
   * Buscar grupos públicos por termo de pesquisa
   */
  @GetMapping("/public/search")
  public ResponseEntity<?> searchPublicGroups(@RequestParam String query) {
    try {
      List<GroupDto> groups = groupService.searchPublicGroups(query);
      return ResponseEntity.ok(groups);
    } catch (Exception e) {
      LOGGER.error("Erro ao buscar grupos com query: {}", query, e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(new ErrorResponse("Erro interno do servidor"));
    }
  }

  /**
   * Adicionar usuário ao grupo
   */
  @PostMapping("/{id}/members")
  public ResponseEntity<?> addUserToGroup(@PathVariable Long id, @RequestParam String username) {
    try {
      GroupDto group = groupService.addUserToGroup(id, username);
      return ResponseEntity.ok(group);
    } catch (IllegalArgumentException | IllegalStateException e) {
      LOGGER.warn("Erro ao adicionar usuário {} ao grupo ID {}: {}", username, id, e.getMessage());
      return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
    } catch (Exception e) {
      LOGGER.error("Erro interno ao adicionar usuário {} ao grupo ID: {}", username, id, e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(new ErrorResponse("Erro interno do servidor"));
    }
  }

  /**
   * Remover usuário do grupo
   */
  @DeleteMapping("/{id}/members")
  public ResponseEntity<?> removeUserFromGroup(@PathVariable Long id, @RequestParam String username) {
    try {
      GroupDto group = groupService.removeUserFromGroup(id, username);
      return ResponseEntity.ok(group);
    } catch (IllegalArgumentException e) {
      LOGGER.warn("Erro ao remover usuário {} do grupo ID {}: {}", username, id, e.getMessage());
      return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
    } catch (Exception e) {
      LOGGER.error("Erro interno ao remover usuário {} do grupo ID: {}", username, id, e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(new ErrorResponse("Erro interno do servidor"));
    }
  }

  /**
   * Verificar se usuário é membro do grupo
   */
  @GetMapping("/{id}/members/{username}")
  public ResponseEntity<?> isUserMemberOfGroup(@PathVariable Long id, @PathVariable String username) {
    try {
      boolean isMember = groupService.isUserMemberOfGroup(id, username);
      return ResponseEntity.ok(new MembershipResponse(isMember));
    } catch (IllegalArgumentException e) {
      LOGGER.warn("Erro ao verificar membro do grupo ID {}: {}", id, e.getMessage());
      return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
    } catch (Exception e) {
      LOGGER.error("Erro interno ao verificar membro do grupo ID: {}", id, e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(new ErrorResponse("Erro interno do servidor"));
    }
  }

  /**
   * Atualizar grupo
   */
  @PutMapping("/{id}")
  public ResponseEntity<?> updateGroup(@PathVariable Long id, @RequestBody UpdateGroupRequest request,
      @RequestParam String username) {
    try {
      GroupDto group = groupService.updateGroup(id, username, request.getName(), request.getDescription(),
          request.getMaxMembers());
      return ResponseEntity.ok(group);
    } catch (IllegalArgumentException e) {
      LOGGER.warn("Erro ao atualizar grupo ID {}: {}", id, e.getMessage());
      return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
    } catch (Exception e) {
      LOGGER.error("Erro interno ao atualizar grupo ID: {}", id, e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(new ErrorResponse("Erro interno do servidor"));
    }
  }

  /**
   * Deletar grupo
   */
  @DeleteMapping("/{id}")
  public ResponseEntity<?> deleteGroup(@PathVariable Long id, @RequestParam String username) {
    try {
      groupService.deleteGroup(id, username);
      return ResponseEntity.ok(new MessageResponse("Grupo removido com sucesso"));
    } catch (IllegalArgumentException e) {
      LOGGER.warn("Erro ao deletar grupo ID {}: {}", id, e.getMessage());
      return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
    } catch (Exception e) {
      LOGGER.error("Erro interno ao deletar grupo ID: {}", id, e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(new ErrorResponse("Erro interno do servidor"));
    }
  }

  /**
   * Contar membros do grupo
   */
  @GetMapping("/{id}/members/count")
  public ResponseEntity<?> countGroupMembers(@PathVariable Long id) {
    try {
      int count = groupService.countGroupMembers(id);
      return ResponseEntity.ok(new CountResponse(count));
    } catch (Exception e) {
      LOGGER.error("Erro ao contar membros do grupo ID: {}", id, e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(new ErrorResponse("Erro interno do servidor"));
    }
  }

  // Classes para respostas específicas
  public static class MembershipResponse {
    private boolean isMember;

    public MembershipResponse(boolean isMember) {
      this.isMember = isMember;
    }

    public boolean getIsMember() {
      return isMember;
    }

    public void setIsMember(boolean isMember) {
      this.isMember = isMember;
    }
  }

  public static class CountResponse {
    private int count;

    public CountResponse(int count) {
      this.count = count;
    }

    public int getCount() {
      return count;
    }

    public void setCount(int count) {
      this.count = count;
    }
  }

  public static class UpdateGroupRequest {
    private String name;
    private String description;
    private Integer maxMembers;

    public String getName() {
      return name;
    }

    public void setName(String name) {
      this.name = name;
    }

    public String getDescription() {
      return description;
    }

    public void setDescription(String description) {
      this.description = description;
    }

    public Integer getMaxMembers() {
      return maxMembers;
    }

    public void setMaxMembers(Integer maxMembers) {
      this.maxMembers = maxMembers;
    }
  }
}