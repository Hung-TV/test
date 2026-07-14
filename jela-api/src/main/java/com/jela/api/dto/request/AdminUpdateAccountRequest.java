package com.jela.api.dto.request;

import lombok.Data;

@Data
public class AdminUpdateAccountRequest {
    private String fullName;
    private String avatarUrl;
    private String currentLevel;
    private String note;
}
