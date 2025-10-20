package com.DsaDudes.User_service.Models;

import com.DsaDudes.User_service.Enums.AuthProvider;
import com.DsaDudes.User_service.Enums.Role;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor

public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String username;
    private String password;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private boolean emailVerified;
    private boolean phoneVerified;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    private AuthProvider provider;  // GOOGLE, GITHUB, LOCAL

    private String providerId;      // ID from Google/GitHub if OAuth2

    @Enumerated(EnumType.STRING)
    private Role role;
    private String profilePhoto;
    private String bio;
    // for saving current selected language in dropdown list at problem page...
     private String current_selected_language = "cpp";

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
