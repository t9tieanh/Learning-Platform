package com.freeclassroom.userservice.filter;

import com.freeclassroom.userservice.dto.request.auth.Identity;
import com.freeclassroom.userservice.utils.JwtUtils;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class IdentityFilter extends OncePerRequestFilter {
    @Value("${cookie.name}")
    private String cookieName;
    private final JwtUtils jwtUtils;

    private String normalizeGuestId(String rawGuestId) {
        if (rawGuestId == null) return null;
        String trimmed = rawGuestId.trim();
        if (trimmed.startsWith("guest-")) {
            return trimmed.substring("guest-".length());
        }
        return trimmed;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");

        if(authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String token = authHeader.substring(7);
                Claims claims = jwtUtils.verifyToken(token);

                String userId = claims.getSubject();
                Identity identity = Identity.builder()
                        .type("USER")
                        .id(userId)
                        .build();

                request.setAttribute("IDENTITY", identity);

                filterChain.doFilter(request, response);
                return;
            } catch (Exception e) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }
        }

        String guestId = null;

        if(request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if (cookie.getName().equals(cookieName)) {
                    guestId = cookie.getValue();
                    break;
                }
            }
        }

        if(guestId == null) {
            guestId = UUID.randomUUID().toString();

            Cookie cookie = new Cookie(cookieName, guestId);
            cookie.setHttpOnly(true);
            cookie.setPath("/");
            cookie.setMaxAge(60 * 60 * 24 * 30); // 30 days
            response.addCookie(cookie);
        } else {
            String normalized = normalizeGuestId(guestId);
            if (normalized != null && !normalized.equals(guestId)) {
                guestId = normalized;
                Cookie cookie = new Cookie(cookieName, guestId);
                cookie.setHttpOnly(true);
                cookie.setPath("/");
                cookie.setMaxAge(60 * 60 * 24 * 30); // 30 days
                response.addCookie(cookie);
            }
        }

        Identity identity = Identity.builder()
                .type("GUEST")
                .id(guestId)
                .build();
        request.setAttribute("IDENTITY", identity);
        filterChain.doFilter(request, response);
    }
}
