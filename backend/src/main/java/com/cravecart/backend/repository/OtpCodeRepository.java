package com.cravecart.backend.repository;

import com.cravecart.backend.entity.OtpCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OtpCodeRepository extends JpaRepository<OtpCode, String> {
}
