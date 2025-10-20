package com.DsaDudes.User_service.DTO;

import com.DsaDudes.User_service.Models.User;
import lombok.Data;
import org.springframework.http.ResponseEntity;

@Data
public class UserDTO {
    public String username;
    public String password;
    public String email;
    public UserDTO(User userDTO) {
        this.username = userDTO.getUsername();
        this.email = userDTO.getEmail();
    }
    public UserDTO() {}
}
