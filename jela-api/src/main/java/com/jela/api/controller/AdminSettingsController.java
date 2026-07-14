package com.jela.api.controller;

import com.jela.api.dto.SystemSettingsDto;
import com.jela.api.service.AdminSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/settings")
@RequiredArgsConstructor
public class AdminSettingsController {

    private final AdminSettingsService adminSettingsService;

    @GetMapping
    public SystemSettingsDto getSettings() {
        return adminSettingsService.getSettings();
    }

    @PutMapping
    public SystemSettingsDto updateSettings(@RequestBody SystemSettingsDto settings) {
        return adminSettingsService.updateSettings(settings);
    }
}
