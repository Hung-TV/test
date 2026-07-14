package com.jela.api.controller;

import com.jela.api.dto.request.*;
import com.jela.api.dto.response.AdminKanjiDetailResponse;
import com.jela.api.dto.response.AdminKanjiListResponse;
import com.jela.api.service.AdminKanjiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/kanji")
@RequiredArgsConstructor
public class AdminKanjiController {

    private final AdminKanjiService adminKanjiService;

    @GetMapping
    public AdminKanjiListResponse getKanjiList(
            @RequestParam(value = "keyword", required = false, defaultValue = "") String keyword,
            @RequestParam(value = "level", required = false, defaultValue = "ALL") String level,
            @RequestParam(value = "status", required = false, defaultValue = "ALL") String status,
            @RequestParam(value = "sortBy", required = false, defaultValue = "updatedAt") String sortBy,
            @RequestParam(value = "sortOrder", required = false, defaultValue = "desc") String sortOrder,
            @RequestParam(value = "page", required = false, defaultValue = "1") int page,
            @RequestParam(value = "limit", required = false, defaultValue = "10") int limit
    ) {
        return adminKanjiService.getKanjiList(keyword, level, status, sortBy, sortOrder, page, limit);
    }

    @GetMapping("/check")
    public java.util.Map<String, Object> checkKanjiExists(@RequestParam("character") String character) {
        return adminKanjiService.checkKanjiExists(character);
    }

    @GetMapping("/{id}")
    public AdminKanjiDetailResponse getKanjiById(@PathVariable("id") Long id) {
        return adminKanjiService.getKanjiById(id);
    }

    @PostMapping
    public AdminKanjiDetailResponse createKanji(@Valid @RequestBody AdminCreateKanjiRequest request) {
        return adminKanjiService.createKanji(request);
    }

    @PutMapping("/{id}")
    public AdminKanjiDetailResponse updateKanji(
            @PathVariable("id") Long id,
            @Valid @RequestBody AdminUpdateKanjiRequest request
    ) {
        return adminKanjiService.updateKanji(id, request);
    }

    @PatchMapping("/{id}/status")
    public AdminKanjiDetailResponse updateKanjiStatus(
            @PathVariable("id") Long id,
            @Valid @RequestBody AdminUpdateKanjiStatusRequest request
    ) {
        return adminKanjiService.updateKanjiStatus(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteKanji(@PathVariable("id") Long id) {
        adminKanjiService.deleteKanji(id);
    }
}
