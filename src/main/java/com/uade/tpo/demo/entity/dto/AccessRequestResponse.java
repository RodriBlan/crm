package com.uade.tpo.demo.entity.dto;

import com.uade.tpo.demo.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AccessRequestResponse {
    private Long id;
    private String username;
    private String role;
    private String status;

    public static AccessRequestResponse from(User user) {
        return new AccessRequestResponse(
                user.getId(),
                user.getUsername(),
                user.getRole().name(),
                user.getStatus() == null ? "ACTIVE" : user.getStatus().name()
        );
    }
}
