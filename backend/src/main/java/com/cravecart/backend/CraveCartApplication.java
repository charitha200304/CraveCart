package com.cravecart.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Import;

@SpringBootApplication
@Import(MyAppSecurityConfig.class)
public class CraveCartApplication {
    public static void main(String[] args) {
        SpringApplication.run(CraveCartApplication.class, args);
    }
}