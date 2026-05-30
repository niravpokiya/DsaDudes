package com.DsaDudes.User_service.DTO;

import com.DsaDudes.User_service.Enums.Role;
import com.DsaDudes.User_service.Models.User;

import java.time.LocalDateTime;

public class AdminUserDTO {
    public int id;
    public String username;
    public String email;
    public String firstName;
    public String lastName;
    public Role role;
    public boolean emailVerified;
    public boolean phoneVerified;
    public LocalDateTime createdAt;
    public LocalDateTime updatedAt;
    public int totalSubmissions;
    public int solvedCount;
    public int easySolvedCount;
    public int mediumSolvedCount;
    public int hardSolvedCount;

    public AdminUserDTO(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.firstName = user.getFirstName();
        this.lastName = user.getLastName();
        this.role = user.getRole();
        this.emailVerified = user.isEmailVerified();
        this.phoneVerified = user.isPhoneVerified();
        this.createdAt = user.getCreatedAt();
        this.updatedAt = user.getUpdatedAt();
        this.totalSubmissions = user.getTotalSubmissions();
        this.solvedCount = user.getSolvedCount();
        this.easySolvedCount = user.getEasySolvedCount();
        this.mediumSolvedCount = user.getMediumSolvedCount();
        this.hardSolvedCount = user.getHardSolvedCount();
    }
}