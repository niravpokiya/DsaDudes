package com.DsaDudes.User_service.DTO;

import lombok.Data;
import org.springframework.http.ResponseEntity;

@Data
public class UserDTO {
    public String username;
    public String password;
    public String email;
}
