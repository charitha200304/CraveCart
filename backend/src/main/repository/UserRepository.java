package com.cravecart.backend.repository;

import com.cravecart.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    User findByVerificationCode(String verificationCode);
    List<User> findByRoleAndApproved(String role, boolean approved);
}
