package com.DsaDudes.User_service.DTO;

import lombok.Data;

@Data
public class UserLoginRequest {
    public String username;
    public String password;
}
