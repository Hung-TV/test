package com.jela.api.controller;

import com.jela.api.dto.response.DictionaryHistoryResponse;
import com.jela.api.service.DictionaryHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/me/dictionary-history")
@RequiredArgsConstructor
public class DictionaryHistoryController {

    private final DictionaryHistoryService dictionaryHistoryService;

    @GetMapping
    public DictionaryHistoryResponse getHistory(Authentication authentication,
                                                @RequestParam(defaultValue = "1") long page) {
        Long userId = authentication != null && authentication.getPrincipal() instanceof Long principal
                ? principal
                : null;
        return dictionaryHistoryService.getHistory(userId, page);
    }
}
