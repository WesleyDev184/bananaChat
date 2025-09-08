package com.bananachat.backend.jms;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jms.core.JmsTemplate;
import org.springframework.stereotype.Component;

import com.bananachat.backend.model.ChatMessage;

@Component
public class MessageProducer {

    private static final Logger LOGGER = LoggerFactory.getLogger(MessageProducer.class);

    @Autowired
    private JmsTemplate jmsTemplate;

    @Value("${jms.chat.topic}")
    private String chatTopic;

    public void sendMessage(ChatMessage chatMessage) {
        try {
            LOGGER.info("Enviando mensagem para o tópico JMS: {}", chatTopic);
            // O JmsTemplate irá converter o objeto ChatMessage para um formato de mensagem (JSON por padrão)
            jmsTemplate.convertAndSend(chatTopic, chatMessage);
        } catch (Exception e) {
            LOGGER.error("Erro ao enviar mensagem para o JMS: ", e);
        }
    }
}
