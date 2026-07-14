package com.jela.api.dataimport;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("!test") // Không chạy import khi chạy test
@RequiredArgsConstructor
public class DataImportRunner implements ApplicationRunner {

    private final DataImportService dataImportService;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        dataImportService.importData();
    }
}
