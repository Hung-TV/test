package com.jela.api.service;

import com.jela.api.dto.SystemSettingsDto;

public interface AdminSettingsService {
    SystemSettingsDto getSettings();
    SystemSettingsDto updateSettings(SystemSettingsDto settings);
}
