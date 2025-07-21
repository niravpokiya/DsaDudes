package com.DsaDudes.User_service.Repository;

import com.DsaDudes.User_service.Models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    User findByUsername(String username);
    boolean existsUserByEmail(String email);
    boolean existsUserByUsername(String username);
}
