package com.DsaDude.Question_service.Helpers;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuthorizationInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception{
        if(!(handler instanceof HandlerMethod method)) {
            return true;
        }
        if(method.hasMethodAnnotation(AdminOnly.class)) {
            String role = request.getHeader("X-ROLE");
            if (role == null || !role.equals("ADMIN")) {
                response.setStatus(403);
                response.getWriter()
                        .write("Forbidden");
                return false;
            }
        }
        return true;
    }
}
