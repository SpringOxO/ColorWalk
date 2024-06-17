package com.example.handler;

import com.example.model.UserData;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

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
            case "incrementZone":
                handleIncrementZone(session);
                break;
            case "updateZone":
                handleUpdateZone(session, data);
                break;
            case "getUserList":
                handleGetUserList(session);
                break;
            case "deleteUser":
                handleDeleteUser(session, data);
                break;
            case "updateUser":
                handleUpdateUser(session, data);
                break;
        }
    }

    private void handleInit(WebSocketSession session, Map<String, Object> data) throws Exception {
        String sessionId = session.getId();
        String newId = (String) data.get("id");
        sid2uid.put(sessionId, newId);
        UserData userData = userSessions.remove(sessionId); // Remove the old entry with sessionId

        if (userData != null) {
            userData.setX(doubleValue(data.get("x")) );
            userData.setY(doubleValue(data.get("y")) );
            userData.setZ(doubleValue(data.get("z")) );
            userData.setId(newId);

            userSessions.put(newId, userData); // Add new entry with newId

            System.out.println("socket.init " + sessionId + " with data: " + data);
        }
    }

    private void handleUpdate(WebSocketSession session, Map<String, Object> data) {
        String userId = sid2uid.get(session.getId());
        UserData userData = userSessions.get(userId);

        if (userData != null) {
            userData.setX(doubleValue(data.get("x")) );
            userData.setY(doubleValue(data.get("y")) );
            userData.setZ(doubleValue(data.get("z")) );

            System.out.println("user.update " + userId + " with data: " + data);
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

    private void handleIncrementZone(WebSocketSession session) {
        String userId = sid2uid.get(session.getId());
        UserData userData = userSessions.get(userId);
        if (userData != null) {
            userData.incrementZonePassed();
            System.out.println("Incremented zone_passed for user: " + userId);
        }
    }

    private void handleUpdateZone(WebSocketSession session, Map<String, Object> data) {
        String userId = sid2uid.get(session.getId());
        UserData userData = userSessions.get(userId);
        if (userData != null && data.containsKey("zone_passed")) {
            userData.setZonePassed((Integer) data.get("zone_passed"));
            System.out.println("Updated zone_passed for user: " + userId + " to: " + data.get("zone_passed"));
        }
    }

    private void handleGetUserList(WebSocketSession session) {
        try {
            System.out.println("User sessions: " + userSessions);
            String userList = objectMapper.writeValueAsString(userSessions.values());
            System.out.println("User list JSON: " + userList);
            session.sendMessage(new TextMessage("{\"type\":\"userList\", \"data\":" + userList + "}"));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // 删除任意用户和更新任意用户：需要传用户id进来
    private void handleDeleteUser(WebSocketSession session, Map<String, Object> data) {
        String userId = (String) data.get("id");
        if (userSessions.containsKey(userId)) {
            userSessions.remove(userId);
            broadcastDeletePlayer(userId);
            System.out.println("Deleted user: " + userId);
        }
    }

    private void handleUpdateUser(WebSocketSession session, Map<String, Object> data) throws Exception {
        String userId = (String) data.get("id");
        UserData userData = userSessions.get(userId);
        if (userData != null) {
            if (data.containsKey("x")) userData.setX(doubleValue(data.get("x")) );
            if (data.containsKey("y")) userData.setY(doubleValue(data.get("y")) );
            if (data.containsKey("z")) userData.setZ(doubleValue(data.get("z")) );
            if (data.containsKey("zone_passed")) userData.setZonePassed((Integer) data.get("zone_passed"));

            // Broadcast the updated user data to all connected sessions
            broadcastPlayerData();
            System.out.println("Updated user data for user: " + userId + " with data: " + data);
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

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
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
