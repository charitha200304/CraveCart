package com.cravecart.backend.config;

import com.cloudinary.Cloudinary;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class CloudinaryConfig {

    @Bean
    public Cloudinary cloudinary() {
        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", System.getenv().getOrDefault("CLOUDINARY_NAME", "djzobuyts"));
        config.put("api_key", System.getenv().getOrDefault("CLOUDINARY_KEY", "155468976843393"));
        config.put("api_secret", System.getenv().getOrDefault("CLOUDINARY_SECRET", "di8R8BlmWOT1azFeaqO6IUbvvoM"));
        return new Cloudinary(config);
    }
}