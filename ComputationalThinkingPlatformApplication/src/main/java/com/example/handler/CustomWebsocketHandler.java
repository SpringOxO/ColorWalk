package com.example.handler;

import com.example.model.UserData;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.web.servlet.server.Session;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.HashMap;
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
    private final Map<String, String> sid2uid = new HashMap<>();

    public CustomWebsocketHandler() {
        ScheduledExecutorService executorService = Executors.newScheduledThreadPool(1);
        executorService.scheduleAtFixedRate(this::broadcastPlayerData, 0, 40, TimeUnit.MILLISECONDS);
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String sessionId = session.getId();
        UserData userData = new UserData(0, 0, 0, sessionId, session);
        //userSessions.put(sessionId, userData);

        session.sendMessage(new TextMessage("{\"type\":\"setId\", \"id\":\"" + sessionId + "\"}"));
        session.sendMessage(new TextMessage("{\"type\":\"colorData\", \"data\":" + objectMapper.writeValueAsString(faceColorMap.values()) + "}"));
        session.sendMessage(new TextMessage("{\"type\":\"remoteData\", \"data\":" + objectMapper.writeValueAsString(sid2uid.values().toArray()) + "}"));
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
            case "chatMessage":
                handleChatMessage(session, data);
                break;
        }
    }

    private void handleInit(WebSocketSession session, Map<String, Object> data) throws Exception {
        String sessionId = session.getId();
        String userId = (String) data.get("id");
        sid2uid.put(sessionId, userId);

        UserData userData = new UserData(0, 0, 0, userId, session);
        userData.setX(doubleValue(data.get("x")) );
        userData.setY(doubleValue(data.get("y")) );
        userData.setZ(doubleValue(data.get("z")) );
        userData.setId(sessionId);

        userSessions.put(userId, userData); // Add new entry with newId
        broadcastOnline(userId);
        System.out.println("socket.init " + sessionId + " with data: " + data);
    }

    private void handleUpdate(WebSocketSession session, Map<String, Object> data) {
        String userId = sid2uid.get(session.getId());
        UserData userData = userSessions.get(userId);

        if (userData != null) {
            userData.setX(doubleValue(data.get("x")) );
            userData.setY(doubleValue(data.get("y")) );
            userData.setZ(doubleValue(data.get("z")) );
            //System.out.println("socket.update " + session.getId() + " with data: " + data);
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

    private void handleChatMessage(WebSocketSession session, Map<String, Object> data) {
        System.out.println("socket.chatMessage ");
        String type = (String) data.get("chatType");
        if (type.equals("private")) {
            handlePrivateChat(session, data);
        } else {
            handlePublicChat(session, data);
        }
    }

    private void handlePrivateChat(WebSocketSession session, Map<String, Object> data) {
        System.out.println("socket.chatMessage private");
        String to = (String) data.get("to");
        String from = sid2uid.get(session.getId());
        String message = (String) data.get("message");

        try {
            String messageData = objectMapper.writeValueAsString(Map.of(
                    "type", "chatMessage",
                    "chatType", "private",
                    "from", from,
                    "message", message
            ));
            userSessions.get(to).getSession().sendMessage(new TextMessage(messageData));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void handlePublicChat(WebSocketSession session, Map<String, Object> data) {
        System.out.println("socket.chatMessage public");
        String from = sid2uid.get(session.getId());
        String message = (String) data.get("message");

        try {
            String messageData = objectMapper.writeValueAsString(Map.of(
                    "type", "chatMessage",
                    "chatType", "public",
                    "from", from,
                    "message", message
            ));
            for (UserData userData : userSessions.values()) {
                if (userData.getSession().isOpen() && userData.getSession() != session) {
                    System.out.println("Sending message to " + userData.getId() + " " + userData.getSession().getId());
                    userData.getSession().sendMessage(new TextMessage(messageData));
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
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

    private void broadcastOnline(String userId) {
        try {
            String message = objectMapper.writeValueAsString(Map.of(
                    "type", "online",
                    "data", userId
            ));
            for (WebSocketSession session : userSessions.values().stream().map(UserData::getSession).toList()) {
                if (session.isOpen() && !session.getId().equals(userId)) {
                    session.sendMessage(new TextMessage(message));
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String sessionId = session.getId();
        String uid = sid2uid.remove(sessionId);
        if (uid != null) {
            userSessions.remove(uid);
            System.out.println(uid + " disconnected");
            broadcastDeletePlayer(uid);
        }
    }

    private void broadcastDeletePlayer(String uid) {
        try {
            String message = objectMapper.writeValueAsString(Map.of(
                    "type", "deletePlayer",
                    "data", uid
            ));
            for (WebSocketSession session : userSessions.values().stream().map(UserData::getSession).toList()) {
                if (session.isOpen()) {
                    System.out.println("Sending delete message to " + sid2uid.get(session.getId()));
                    session.sendMessage(new TextMessage(message));
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
