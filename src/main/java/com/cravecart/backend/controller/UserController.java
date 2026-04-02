package com.cravecart.backend.controller;

import com.cravecart.backend.model.User;
import com.cravecart.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/addUser")
    public User registerUser(@RequestBody User user) {
        return userRepository.save(user);
    }
}