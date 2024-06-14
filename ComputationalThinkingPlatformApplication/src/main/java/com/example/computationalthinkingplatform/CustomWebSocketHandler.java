package com.example.computationalthinkingplatform;

import com.example.model.UserData;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import static org.apache.ibatis.ognl.OgnlOps.doubleValue;

@Component
public class CustomWebSocketHandler extends TextWebSocketHandler {

    private final Map<String, UserData> userSessions = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String sessionId = session.getId();
        UserData userData = new UserData(0, 0, 0, 0, "Idle", sessionId, session);
        userSessions.put(sessionId, userData);

        session.sendMessage(new TextMessage("{\"type\":\"setId\", \"id\":\"" + sessionId + "\"}"));
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
            case "chat message":
                handleChatMessage(session, data);
                break;
        }
    }

    private void handleInit(WebSocketSession session, Map<String, Object> data) throws Exception {
        UserData userData = userSessions.get(session.getId());
        userData.setModel((String) data.get("model"));
        userData.setColour((String) data.get("colour"));
        userData.setX(doubleValue(data.get("x")) );
        userData.setY(doubleValue(data.get("y")) );
        userData.setZ(doubleValue(data.get("z")) );
        userData.setHeading(doubleValue(data.get("h")) );
        userData.setPb(doubleValue(data.get("pb")));
        userData.setAction("Idle");

        System.out.println("socket.init " + data.get("model"));
    }

    private void handleUpdate(WebSocketSession session, Map<String, Object> data) {
        UserData userData = userSessions.get(session.getId());
        userData.setX(doubleValue(data.get("x")) );
        userData.setY(doubleValue(data.get("y")) );
        userData.setZ(doubleValue(data.get("z")) );
        userData.setHeading(doubleValue(data.get("h")) );
        userData.setPb(doubleValue(data.get("pb")));
        userData.setAction((String) data.get("action"));
    }

    private void handleChatMessage(WebSocketSession session, Map<String, Object> data) throws Exception {
        String message = (String) data.get("message");
        System.out.println(message);

        for (UserData userData : userSessions.values()) {
            WebSocketSession s = userData.getSession();
            if (s.isOpen() && !s.getId().equals(session.getId())) {
                s.sendMessage(new TextMessage("{\"type\":\"chat message\", \"message\":\"" + message + "\"}"));
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        userSessions.remove(session.getId());
        for (UserData userData : userSessions.values()) {
            WebSocketSession s = userData.getSession();
            if (s.isOpen()) {
                s.sendMessage(new TextMessage("{\"type\":\"deletePlayer\", \"id\":\"" + session.getId() + "\"}"));
            }
        }
    }
}
