package com.DsaDudes.User_service.DTO;

import com.DsaDudes.User_service.Enums.Role;
import com.DsaDudes.User_service.Models.User;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ProfileResponse {
    private int id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private boolean emailVerified;
    private boolean phoneVerified;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Role role;
    private String profilePhoto;
    private String bio;
    private int totalSubmissions;
    private long solvedCount;
    private long easySolvedCount;
    private long mediumSolvedCount;
    private long hardSolvedCount;

    public ProfileResponse(User user, SolvedStatsResponse stats) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.firstName = user.getFirstName();
        this.lastName = user.getLastName();
        this.phone = user.getPhone();
        this.emailVerified = user.isEmailVerified();
        this.phoneVerified = user.isPhoneVerified();
        this.createdAt = user.getCreatedAt();
        this.updatedAt = user.getUpdatedAt();
        this.role = user.getRole();
        this.profilePhoto = user.getProfilePhoto();
        this.bio = user.getBio();
        this.totalSubmissions = user.getTotalSubmissions();
        this.solvedCount = stats.getSolvedCount();
        this.easySolvedCount = stats.getEasySolvedCount();
        this.mediumSolvedCount = stats.getMediumSolvedCount();
        this.hardSolvedCount = stats.getHardSolvedCount();
    }
}
