package com.cravecart.backend.controller;

import com.cravecart.backend.entity.User;
import com.cravecart.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @PostMapping("/addUser")
    public User registerUser(@RequestBody User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }
    @PostMapping("/login")
    public String loginUser(@RequestBody User loginDetails) {
        User user = userRepository.findByEmail(loginDetails.getEmail());

        if (user != null) {
            if (passwordEncoder.matches(loginDetails.getPassword(), user.getPassword())) {
                return "Login Successful! Role: " + user.getRole();
            }
        }
        return "Invalid Email or Password!";
    }
}