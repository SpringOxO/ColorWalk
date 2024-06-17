package com.example.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.web.socket.WebSocketSession;

import java.util.HashMap;
import java.util.Map;

public class UserData {
    private double x;
    private double y;
    private double z;
    private String id;
    @JsonIgnore
    private WebSocketSession session;
    private int zonePassed;

    public UserData(double x, double y, double z, String id, WebSocketSession session) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.id = id;
        this.session = session;
        this.zonePassed = 0; // Default value
    }

    // Getters and setters for all fields
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

    public void setId(String id) {
        this.id = id;
    }

    public WebSocketSession getSession() {
        return session;
    }

    public void setSession(WebSocketSession session) {
        this.session = session;
    }

    public int getZonePassed() {
        return zonePassed;
    }

    public void setZonePassed(int zonePassed) {
        this.zonePassed = zonePassed;
    }

    public void incrementZonePassed() {
        this.zonePassed++;
    }
    // Helper method to convert UserData to Map
    public Map<String, Object> toMap() {
        Map<String, Object> map = new HashMap<>();
        map.put("x", x);
        map.put("y", y);
        map.put("z", z);
        map.put("id", id);
        map.put("zonePassed", zonePassed);
        return map;
    }
}
