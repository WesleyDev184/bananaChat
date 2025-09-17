package com.bananachat.backend.controller;

import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bananachat.backend.service.OnlineUsersService;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*") // Permite CORS para desenvolvimento
public class OnlineUsersController {

    @Autowired
    private OnlineUsersService onlineUsersService;

    /**
     * Endpoint para buscar todos os usuários online
     */
    @GetMapping("/online")
    public ResponseEntity<Set<String>> getOnlineUsers() {
        Set<String> onlineUsers = onlineUsersService.getOnlineUsers();
        return ResponseEntity.ok(onlineUsers);
    }

    /**
     * Endpoint para buscar o número de usuários online
     */
    @GetMapping("/online/count")
    public ResponseEntity<Integer> getOnlineUsersCount() {
        int count = onlineUsersService.getOnlineUsersCount();
        return ResponseEntity.ok(count);
    }
}