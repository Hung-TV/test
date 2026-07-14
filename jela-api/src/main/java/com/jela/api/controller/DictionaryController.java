package com.jela.api.controller;

import com.jela.api.dto.response.DictionarySearchResponse;
import com.jela.api.dto.response.DictionaryDetailResponse;
import com.jela.api.service.DictionaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dictionary")
@RequiredArgsConstructor
public class DictionaryController {

    private final DictionaryService dictionaryService;

    @GetMapping("/search")
    public List<DictionarySearchResponse> search(@RequestParam String searchKey) {
        return dictionaryService.search(searchKey);
    }

    @GetMapping("/{id}")
    public DictionaryDetailResponse searchId(Authentication authentication, @PathVariable("id") Long wordId) {
        Long userId = authentication != null && authentication.getPrincipal() instanceof Long principal
                ? principal
                : null;
        return dictionaryService.searchId(userId, wordId);
    }
}
