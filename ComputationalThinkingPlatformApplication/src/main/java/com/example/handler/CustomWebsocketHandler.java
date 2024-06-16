package com.example.handler;

import com.example.model.UserData;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import static org.apache.ibatis.ognl.OgnlOps.doubleValue;

@Component
public class CustomWebsocketHandler extends TextWebSocketHandler {

    private final Map<String, UserData> userSessions = new ConcurrentHashMap<>();
    private final Map<String, Map<String, String>> faceColorMap = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public CustomWebsocketHandler() {
        ScheduledExecutorService executorService = Executors.newScheduledThreadPool(1);
        executorService.scheduleAtFixedRate(this::broadcastPlayerData, 0, 40, TimeUnit.MILLISECONDS);
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String sessionId = session.getId();
        UserData userData = new UserData(0, 0, 0,  sessionId, session);
        userSessions.put(sessionId, userData);

        session.sendMessage(new TextMessage("{\"type\":\"setId\", \"id\":\"" + sessionId + "\"}"));
        session.sendMessage(new TextMessage("{\"type\":\"colorData\", \"data\":" + objectMapper.writeValueAsString(faceColorMap.values()) + "}"));

        System.out.println(sessionId + " connected");
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        Map<String, Object> data = objectMapper.readValue(payload, Map.class);
        String type = (String) data.get("type");

        switch (type) {
            case "init":
                handleInit(session, data);
                break;
            case "update":
                handleUpdate(session, data);
                break;
            case "colorFace":
                handleColorFace(session, data);
                break;
        }
    }

    private void handleInit(WebSocketSession session, Map<String, Object> data) throws Exception {
        UserData userData = userSessions.get(session.getId());
        if (userData != null) {
            userData.setX(doubleValue(data.get("x")) );
            userData.setY(doubleValue(data.get("y")) );
            userData.setZ(doubleValue(data.get("z")) );
            System.out.println("socket.init " + session.getId() + " with data: " + data);
        }
    }

    private void handleUpdate(WebSocketSession session, Map<String, Object> data) {
        UserData userData = userSessions.get(session.getId());
        if (userData != null) {
            userData.setX(doubleValue(data.get("x")) );
            userData.setY(doubleValue(data.get("y")) );
            userData.setZ(doubleValue(data.get("z")) );
            System.out.println("socket.update " + session.getId() + " with data: " + data);
        }
    }


    private void handleColorFace(WebSocketSession session, Map<String, Object> data) throws Exception {
        String key = objectMapper.writeValueAsString(data.get("points"));
        faceColorMap.put(key, Map.of(
                "points", objectMapper.writeValueAsString(data.get("points")),
                "color", (String) data.get("color")
        ));

        broadcastColorData();
        System.out.println(data.get("points") + " " + data.get("color"));
    }

    private void broadcastPlayerData() {
        try {
            Map<String, Object> remoteData = Map.of(
                    "type", "remoteData",
                    "data", userSessions.values().stream().map(UserData::toMap).toArray()
            );
            String message = objectMapper.writeValueAsString(remoteData);
            for (WebSocketSession session : userSessions.values().stream().map(UserData::getSession).toList()) {
                if (session.isOpen()) {
                    session.sendMessage(new TextMessage(message));
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void broadcastColorData() {
        try {
            String message = objectMapper.writeValueAsString(Map.of(
                    "type", "colorData",
                    "data", faceColorMap.values()
            ));
            for (WebSocketSession session : userSessions.values().stream().map(UserData::getSession).toList()) {
                if (session.isOpen()) {
                    session.sendMessage(new TextMessage(message));
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        System.out.println("socket.closed " + session.getId());
        userSessions.remove(session.getId());
        broadcastDeletePlayer(session.getId());
    }

    private void broadcastDeletePlayer(String sessionId) {
        try {
            String message = objectMapper.writeValueAsString(Map.of(
                    "type", "deletePlayer",
                    "id", sessionId
            ));
            for (WebSocketSession session : userSessions.values().stream().map(UserData::getSession).toList()) {
                if (session.isOpen()) {
                    session.sendMessage(new TextMessage(message));
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
