package com.jela.api.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateProfileRequest {
    private String fullName;
    private String phone;
    private String avatarUrl;
    private String level;
}
