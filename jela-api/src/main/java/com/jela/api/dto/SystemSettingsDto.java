package com.jela.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemSettingsDto {
    private String appName;
    private boolean allowRegistration;
    private boolean allowGoogleLogin;
    private String defaultUserLevel;
    private int defaultQuizQuestionCount;
    private int quizPassScore;
    private boolean maintenanceMode;
    private String maintenanceMessage;
}
