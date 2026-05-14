package com.cravecart.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.context.annotation.Import;

@SpringBootApplication
@EnableAsync
@Import(MyAppSecurityConfig.class)
public class CraveCartApplication {
    public static void main(String[] args) {
        SpringApplication.run(CraveCartApplication.class, args);
    }
}