package com.example.model;

import org.springframework.web.socket.WebSocketSession;

public class UserData {
    private double x;
    private double y;
    private double z;
    private double heading;
    private double pb;
    private String action;
    private String model;
    private String colour;
    private final String id;
    private final WebSocketSession session; // 新增 WebSocketSession 字段

    public UserData(double x, double y, double z, double heading, String action, String id, WebSocketSession session) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.heading = heading;
        this.action = action;
        this.id = id;
        this.session = session;
    }

    // Getters and Setters
    public double getX() { return x; }
    public void setX(double x) { this.x = x; }
    public double getY() { return y; }
    public void setY(double y) { this.y = y; }
    public double getZ() { return z; }
    public void setZ(double z) { this.z = z; }
    public double getHeading() { return heading; }
    public void setHeading(double heading) { this.heading = heading; }
    public double getPb() { return pb; }
    public void setPb(double pb) { this.pb = pb; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }
    public String getColour() { return colour; }
    public void setColour(String colour) { this.colour = colour; }
    public String getId() { return id; }
    public WebSocketSession getSession() { return session; } // Getter for session
}
