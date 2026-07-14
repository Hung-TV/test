package com.jela.api.dataimport;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.data-import")
public class DataImportProperties {

    private boolean enabled = true;
    private String dir;
    private int batchSize = 1000;

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getDir() {
        return dir;
    }

    public void setDir(String dir) {
        this.dir = dir;
    }

    public int getBatchSize() {
        return batchSize;
    }

    public void setBatchSize(int batchSize) {
        this.batchSize = batchSize;
    }

    public java.nio.file.Path resolveDataDir() {
        if (dir != null && !dir.isBlank()) {
            java.nio.file.Path path = java.nio.file.Path.of(dir).toAbsolutePath().normalize();
            if (java.nio.file.Files.isDirectory(path)) {
                return path;
            }
        }

        java.nio.file.Path currentDirCandidate = java.nio.file.Path.of("data-import").toAbsolutePath().normalize();
        if (java.nio.file.Files.isDirectory(currentDirCandidate)) {
            return currentDirCandidate;
        }

        return java.nio.file.Path.of("../data-import").toAbsolutePath().normalize();
    }
}
