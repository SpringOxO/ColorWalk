package com.example.computationalthinkingplatform;

import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import java.io.IOException;

public class MyWebSocketHandler extends TextWebSocketHandler {

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
        // 处理从客户端收到的消息
        String payload = message.getPayload();
        System.out.println("Received: " + payload);

        // 发送回复消息
        session.sendMessage(new TextMessage("Hello, " + payload));
    }
}
