package com.jela.api.controller;

import com.jela.api.dto.response.KanjiDetailResponse;
import com.jela.api.dto.response.KanjiLevelResponse;
import com.jela.api.dto.response.KanjiSearchResponse;
import com.jela.api.dto.response.KanjiSummaryResponse;
import com.jela.api.service.KanjiService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/kanji")
@RequiredArgsConstructor
public class KanjiController {

    private final KanjiService kanjiService;

    // GET /api/kanji - optional auth; returns level overview
    @GetMapping
    public List<KanjiLevelResponse> getLevels(Authentication authentication) {
        Long userId = extractUserId(authentication);
        return kanjiService.getLevels(userId);
    }

    // GET /api/kanji/list?level=N5&page=1 - public, fixed page size 10
    @GetMapping("/list")
    public Page<KanjiSummaryResponse> getKanjiByLevel(
            @RequestParam String level,
            @RequestParam(defaultValue = "1") int page) {
        return kanjiService.getKanjiByLevel(level, page);
    }

    // GET /api/kanji/search?searchKey=... - public
    @GetMapping("/search")
    public List<KanjiSearchResponse> search(@RequestParam String searchKey) {
        return kanjiService.search(searchKey);
    }

    // GET /api/kanji/{id} - optional auth; auto-records history if authenticated
    @GetMapping("/{id}")
    public KanjiDetailResponse getDetail(@PathVariable Long id, Authentication authentication) {
        Long userId = extractUserId(authentication);
        return kanjiService.getDetail(id, userId);
    }

    private Long extractUserId(Authentication authentication) {
        return authentication != null && authentication.getPrincipal() instanceof Long principal
                ? principal
                : null;
    }
}
