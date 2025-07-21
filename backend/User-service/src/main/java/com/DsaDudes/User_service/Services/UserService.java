package com.DsaDudes.User_service.Services;

import com.DsaDudes.User_service.DTO.UserDTO;
import com.DsaDudes.User_service.Enums.Role;
import com.DsaDudes.User_service.Models.User;
import com.DsaDudes.User_service.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private JWTService jwtService;
    public ResponseEntity<String> registerUser(UserDTO user) {
        if(userRepository.existsUserByEmail(user.email)) {
            return ResponseEntity.badRequest().body("Email Already Exists");
        }
        if(userRepository.existsUserByUsername(user.username)) {
            return ResponseEntity.badRequest().body("Username Already Exists");
        }
        User newUser = new User();

        newUser.setUsername(user.username);
        newUser.setPassword(passwordEncoder.encode(user.password));
        newUser.setEmail(user.email);
        newUser.setRole(Role.USER);
        userRepository.save(newUser);

        return ResponseEntity.ok().body("success !");
    }

    public ResponseEntity<String> verify(UserDTO user) {
        Authentication auth = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword()));
        if(auth.isAuthenticated())
            return ResponseEntity.ok(jwtService.generateJWTToken(user));
        else
            return ResponseEntity.badRequest().body("Authentication failed. Please try again.");
    }
    public User findUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.isAuthenticated() == false || auth.getPrincipal() == null) {
            return null;
        }
        String username = auth.getName();
        return userRepository.findByUsername(username);
    }
}
