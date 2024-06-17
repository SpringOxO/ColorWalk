package com.example.controller;

import com.example.model.User;
import com.example.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.*;

import javax.persistence.criteria.CriteriaBuilder;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public Map<String, String> registerUser(@RequestBody User user) {
        return userService.registerUser(user);
    }

    @PostMapping("/login")
    public Map<String, String> getToken(@RequestBody Map<String, String> map) {
        String username = map.get("username");
        String password = map.get("password");
        return userService.login(username, password);
    }

    @PostMapping("/updatezone")
    public Map<String, String> updateZone(@RequestBody Map<String, String> map) {
        String username = map.get("username");
        Integer zone_passed = Integer.parseInt(map.get("zone_passed"));
        return userService.handleUpdateZone(username,zone_passed);
    }

    @PostMapping("/increment")
    public Map<String, String> incrementZonePassed(@RequestBody Map<String, String> map) {
        String username = map.get("username");
        return userService.incrementZonePassed(username);
    }

    @GetMapping("/getuserlist")
    public ResponseEntity<?> getUserList() {
        return ResponseEntity.ok(userService.getUserList());
    }

    @DeleteMapping("/delete")
    public Map<String, String> deleteUser(@RequestBody Map<String, String> map) {
        String username = map.get("username");
        return userService.deleteUser(username);
    }

    @PutMapping("/update")
    public Map<String, String> updateUser(@RequestBody User user) {
        return userService.updateUser(user);
    }

    @GetMapping("/getownuser")
    public User getOwnUser(@RequestBody Map<String, String> map) {
        String username = map.get("username");
        return userService.getOwnUser(username);
    }
}