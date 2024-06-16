package com.example.model;

import org.springframework.web.socket.WebSocketSession;

import java.util.HashMap;
import java.util.Map;

public class UserData {
    private double x;
    private double y;
    private double z;
    private String id;
    private WebSocketSession session;

    public UserData(double x, double y, double z, String id, WebSocketSession session) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.id = id;
        this.session = session;
    }

    public double getX() {
        return x;
    }

    public void setX(double x) {
        this.x = x;
    }

    public double getY() {
        return y;
    }

    public void setY(double y) {
        this.y = y;
    }

    public double getZ() {
        return z;
    }

    public void setZ(double z) {
        this.z = z;
    }

    public String getId() {
        return id;
    }

    public WebSocketSession getSession() {
        return session;
    }

    public void setSession(WebSocketSession session) {
        this.session = session;
    }

    public Map<String, Object> toMap() {
        Map<String, Object> map = new HashMap<>();
        map.put("id", id);
        map.put("x", x);
        map.put("y", y);
        map.put("z", z);
        return map;
    }
}
