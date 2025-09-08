package com.bananachat.backend.jms;

import org.springframework.jms.annotation.JmsListener;
import org.springframework.stereotype.Component;

@Component
public class MessageConsumer {

    @JmsListener(destination = "chat.topic")
    public void receiveMessage(String message) {
        System.out.println("Mensagem recebida: " + message);
    }
}
