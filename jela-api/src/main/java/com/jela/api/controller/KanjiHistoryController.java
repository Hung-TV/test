package com.jela.api.controller;

import com.jela.api.dto.response.KanjiHistoryResponse;
import com.jela.api.service.KanjiHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/me/kanji-history")
@RequiredArgsConstructor
public class KanjiHistoryController {

    private final KanjiHistoryService kanjiHistoryService;

    // GET /api/me/kanji-history?page=1
    @GetMapping
    public KanjiHistoryResponse getHistory(
            Authentication authentication,
            @RequestParam(defaultValue = "1") long page) {
        Long userId = extractUserId(authentication);
        return kanjiHistoryService.getHistory(userId, page);
    }

    // DELETE /api/me/kanji-history/{kanjiId}
    @DeleteMapping("/{kanjiId}")
    public ResponseEntity<Map<String, String>> deleteHistory(
            Authentication authentication,
            @PathVariable Long kanjiId) {
        Long userId = extractUserId(authentication);
        kanjiHistoryService.deleteHistory(userId, kanjiId);
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Đã xóa khỏi lịch sử tra cứu."
        ));
    }

    private Long extractUserId(Authentication authentication) {
        return authentication != null && authentication.getPrincipal() instanceof Long principal
                ? principal
                : null;
    }
}
