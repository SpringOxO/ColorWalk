package com.example.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
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
import java.util.List;
import java.util.Map;

@Service
public class UserService {
    @Autowired
    UserMapper userMapper;
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Map<String, String> registerUser(User user) {
        Map<String, String> res = new HashMap<>();
        String status;
        // 用户名唯一性检查
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("username", user.getUsername());
        List<User> userList = userMapper.selectList(queryWrapper);
        if (!userList.isEmpty()) {
            status = "用户已存在";
            res.put("message", status);
            return res;
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userMapper.insert(user);
        res.put("message", "success");
        return res;
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

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
            jwt = JwtUtil.createJWT(Integer.toString(user.getId()));
            map.put("message", "success");
            map.put("token", jwt);
        } catch (AuthenticationException e) {
            System.out.println("Login failed: " + e.getMessage());
            map.put("message", e.getMessage());
        }
        return map;
    }
}
