package com.DsaDudes.User_service.Security;

import com.DsaDudes.User_service.Services.CustomUserDetailsService;
import com.DsaDudes.User_service.Services.JWTService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {
    @Autowired
    ApplicationContext applicationContext;

    @Autowired
    private JWTService jwtService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException, ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        String token = null, username = null;
        if(authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
            username = jwtService.extractUsername(token);
        }
        if(username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userService = applicationContext.getBean(CustomUserDetailsService.class).loadUserByUsername(username);
            if(jwtService.validateToken(token, userService)) {
                UsernamePasswordAuthenticationToken Authtoken = new UsernamePasswordAuthenticationToken(userService,
                                                            null, userService.getAuthorities());
                Authtoken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(Authtoken);
            }
        }
        filterChain.doFilter(request, response);
    }
}
