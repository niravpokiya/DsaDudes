package com.DsaDudes.User_service.Models;

import com.DsaDudes.User_service.Enums.AuthProvider;
import com.DsaDudes.User_service.Enums.Role;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "Users")
public class User implements UserDetails {
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

    private String providerId;      // D from Google/GitHub if OAuth2I

    @Enumerated(EnumType.STRING)
    private Role role;
    private String profilePhoto;
    private String bio;

    private int totalSubmissions;
    private int solvedCount;
    private int easySolvedCount;
    private int mediumSolvedCount;
    private int hardSolvedCount;

    // for saving current selected language in dropdown list at problem page...
    private String current_selected_language = "cpp";
    @PrePersist
    protected void onCreate() {
        easySolvedCount = mediumSolvedCount = hardSolvedCount = solvedCount = totalSubmissions = 0;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(
                new SimpleGrantedAuthority("ROLE_" + role.name())
        );
    }
}
