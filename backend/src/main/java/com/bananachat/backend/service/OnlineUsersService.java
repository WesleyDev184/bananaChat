package com.bananachat.backend.service;

import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class OnlineUsersService {

    private static final Logger LOGGER = LoggerFactory.getLogger(OnlineUsersService.class);

    // Thread-safe set para usuários online
    private final Set<String> onlineUsers = ConcurrentHashMap.newKeySet();

    /**
     * Adiciona um usuário à lista de usuários online
     */
    public void addUser(String username) {
        if (username != null && !username.trim().isEmpty()) {
            onlineUsers.add(username);
            LOGGER.info("Usuário {} adicionado à lista de usuários online. Total: {}", username, onlineUsers.size());
        }
    }

    /**
     * Remove um usuário da lista de usuários online
     */
    public void removeUser(String username) {
        if (username != null) {
            boolean removed = onlineUsers.remove(username);
            if (removed) {
                LOGGER.info("Usuário {} removido da lista de usuários online. Total: {}", username, onlineUsers.size());
            }
        }
    }

    /**
     * Retorna a lista de usuários online
     */
    public Set<String> getOnlineUsers() {
        return new HashSet<>(onlineUsers); // Retorna uma cópia para evitar modificações externas
    }

    /**
     * Verifica se um usuário está online
     */
    public boolean isUserOnline(String username) {
        return username != null && onlineUsers.contains(username);
    }

    /**
     * Retorna o número de usuários online
     */
    public int getOnlineUsersCount() {
        return onlineUsers.size();
    }
}