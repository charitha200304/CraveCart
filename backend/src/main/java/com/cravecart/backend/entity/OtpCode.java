package com.cravecart.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "otp_codes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OtpCode {
    @Id
    private String email;

    private String code;

    private LocalDateTime expiryTime;

    @Builder.Default
    private Boolean verified = false;
}
