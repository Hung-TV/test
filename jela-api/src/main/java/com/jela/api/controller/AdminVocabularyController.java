package com.jela.api.controller;

import com.jela.api.dto.request.*;
import com.jela.api.dto.response.AdminVocabularyDetailResponse;
import com.jela.api.dto.response.AdminVocabularyListResponse;
import com.jela.api.service.AdminVocabularyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/vocabulary")
@RequiredArgsConstructor
public class AdminVocabularyController {

    private final AdminVocabularyService adminVocabularyService;

    @GetMapping
    public AdminVocabularyListResponse getVocabularyList(
            @RequestParam(value = "keyword", required = false, defaultValue = "") String keyword,
            @RequestParam(value = "level", required = false, defaultValue = "ALL") String level,
            @RequestParam(value = "status", required = false, defaultValue = "ALL") String status,
            @RequestParam(value = "sortBy", required = false, defaultValue = "updatedAt") String sortBy,
            @RequestParam(value = "sortOrder", required = false, defaultValue = "desc") String sortOrder,
            @RequestParam(value = "page", required = false, defaultValue = "1") int page,
            @RequestParam(value = "limit", required = false, defaultValue = "10") int limit
    ) {
        return adminVocabularyService.getVocabularyList(keyword, level, status, sortBy, sortOrder, page, limit);
    }

    @GetMapping("/check")
    public Map<String, Object> checkVocabularyExists(
            @RequestParam("word") String word,
            @RequestParam("kana") String kana
    ) {
        return adminVocabularyService.checkVocabularyExists(word, kana);
    }

    @GetMapping("/{id}")
    public AdminVocabularyDetailResponse getVocabularyById(@PathVariable("id") Long id) {
        return adminVocabularyService.getVocabularyById(id);
    }

    @PostMapping
    public AdminVocabularyDetailResponse createVocabulary(@Valid @RequestBody AdminCreateVocabularyRequest request) {
        return adminVocabularyService.createVocabulary(request);
    }

    @PutMapping("/{id}")
    public AdminVocabularyDetailResponse updateVocabulary(
            @PathVariable("id") Long id,
            @Valid @RequestBody AdminUpdateVocabularyRequest request
    ) {
        return adminVocabularyService.updateVocabulary(id, request);
    }

    @PatchMapping("/{id}/status")
    public AdminVocabularyDetailResponse updateVocabularyStatus(
            @PathVariable("id") Long id,
            @Valid @RequestBody AdminUpdateVocabularyStatusRequest request
    ) {
        return adminVocabularyService.updateVocabularyStatus(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteVocabulary(@PathVariable("id") Long id) {
        adminVocabularyService.deleteVocabulary(id);
    }
}
