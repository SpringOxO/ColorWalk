package com.example.service;

import com.example.mapper.UserMapper;
import com.example.model.User;
import com.example.repository.UserRepository;
import com.example.utils.JwtUtil;
import com.example.utils.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User registerUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Autowired
    UserMapper userMapper;
    @Autowired
    private AuthenticationManager authenticationManager;
    public Map<String, String> login(String username, String password) {
        UsernamePasswordAuthenticationToken authenticationToken =
                new UsernamePasswordAuthenticationToken(username, password);
//        System.out.println(username);
        Map<String, String> map = new HashMap<>();
        try {
            Authentication authenticate = authenticationManager.authenticate(authenticationToken);//登录失败会自动处理
            UserDetailsImpl loginUser = (UserDetailsImpl) authenticate.getPrincipal();
            User user = loginUser.getUser();
            String jwt = new String();
            jwt = JwtUtil.createJWT(user.getId().toString());
            map.put("message", "success");
            map.put("token", jwt);
        } catch (AuthenticationException e) {
            System.out.println("Login failed: " + e.getMessage());
            map.put("message", e.getMessage());
        }
        return map;
    }
}
