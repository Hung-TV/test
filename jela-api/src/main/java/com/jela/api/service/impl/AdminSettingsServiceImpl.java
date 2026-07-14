package com.jela.api.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jela.api.dto.SystemSettingsDto;
import com.jela.api.service.AdminSettingsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminSettingsServiceImpl implements AdminSettingsService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    private Path getSettingsFilePath() {
        Path candidate1 = Path.of("data-import/system_settings.json").toAbsolutePath().normalize();
        if (Files.exists(candidate1.getParent())) {
            return candidate1;
        }
        return Path.of("../data-import/system_settings.json").toAbsolutePath().normalize();
    }

    private SystemSettingsDto getDefaultSettings() {
        return SystemSettingsDto.builder()
                .appName("JELA")
                .allowRegistration(true)
                .allowGoogleLogin(true)
                .defaultUserLevel("N5")
                .defaultQuizQuestionCount(10)
                .quizPassScore(70)
                .maintenanceMode(false)
                .maintenanceMessage("Hệ thống đang bảo trì. Vui lòng quay lại sau.")
                .build();
    }

    @Override
    public synchronized SystemSettingsDto getSettings() {
        Path path = getSettingsFilePath();
        try {
            if (Files.exists(path)) {
                return objectMapper.readValue(path.toFile(), SystemSettingsDto.class);
            }
        } catch (Exception e) {
            log.error("Failed to read system settings, falling back to defaults", e);
        }
        
        // If not exists or read failed, write default settings
        SystemSettingsDto defaults = getDefaultSettings();
        try {
            Files.createDirectories(path.getParent());
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(path.toFile(), defaults);
        } catch (Exception e) {
            log.error("Failed to write default system settings", e);
        }
        return defaults;
    }

    @Override
    public synchronized SystemSettingsDto updateSettings(SystemSettingsDto settings) {
        Path path = getSettingsFilePath();
        try {
            Files.createDirectories(path.getParent());
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(path.toFile(), settings);
            log.info("System settings updated successfully at {}", path.getFileName());
        } catch (Exception e) {
            log.error("Failed to save system settings", e);
        }
        return settings;
    }
}
