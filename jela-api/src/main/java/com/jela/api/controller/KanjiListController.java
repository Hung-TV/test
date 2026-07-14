package com.jela.api.controller;

import com.jela.api.dto.request.AddKanjiToListRequest;
import com.jela.api.dto.request.CreateKanjiListRequest;
import com.jela.api.dto.request.KanjiReviewRequest;
import com.jela.api.dto.response.KanjiLearnSessionResponse;
import com.jela.api.dto.response.KanjiLearningListResponse;
import com.jela.api.dto.response.KanjiListLearnSummaryResponse;
import com.jela.api.dto.response.KanjiListSummaryResponse;
import com.jela.api.dto.response.KanjiListDetailResponse;
import com.jela.api.dto.response.KanjiReviewResultResponse;
import com.jela.api.dto.response.KanjiReviewSessionResponse;
import com.jela.api.dto.request.KanjiExplainRequest;
import com.jela.api.service.KanjiListService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyEmitter;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class KanjiListController {

    private final KanjiListService kanjiListService;

    // GET /api/me/kanji-list/all
    @GetMapping("/api/me/kanji-list/all")
    public List<KanjiListLearnSummaryResponse> getUserLists(Authentication authentication) {
        Long userId = extractUserId(authentication);
        return kanjiListService.getUserLists(userId);
    }

    // POST /api/me/kanji-list/create
    @PostMapping("/api/me/kanji-list/create")
    public ResponseEntity<KanjiListSummaryResponse> createList(
            Authentication authentication,
            @Valid @RequestBody CreateKanjiListRequest request) {
        Long userId = extractUserId(authentication);
        KanjiListSummaryResponse created = kanjiListService.createList(userId, request.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // POST /api/me/kanji-list/levels/{level}/start
    @PostMapping("/api/me/kanji-list/levels/{level}/start")
    public KanjiLearningListResponse startLevelList(
            Authentication authentication,
            @PathVariable String level) {
        Long userId = extractUserId(authentication);
        return kanjiListService.startLevelList(userId, level);
    }

    // GET /api/me/kanji-list/{listId}/learn?
    @GetMapping("/api/me/kanji-list/{listId}/learn")
    public KanjiLearnSessionResponse getLearnSessionByList(
            Authentication authentication,
            @PathVariable Long listId,
            @RequestParam int batchSize) {
        Long userId = extractUserId(authentication);
        return kanjiListService.getLearnSessionByList(userId, listId, batchSize);
    }

    // POST /api/me/kanji-list/{listId}/review
    @PostMapping("/api/me/kanji-list/{listId}/review")
    public KanjiReviewResultResponse submitReview(
            Authentication authentication,
            @PathVariable Long listId,
            @Valid @RequestBody KanjiReviewRequest request) {
        Long userId = extractUserId(authentication);
        return kanjiListService.submitReview(userId, listId, request);
    }

    // POST /api/me/kanji-list/{listId}/items
    @PostMapping("/api/me/kanji-list/{listId}/items")
    public ResponseEntity<Map<String, Object>> addKanjiToList(
            Authentication authentication,
            @PathVariable Long listId,
            @Valid @RequestBody AddKanjiToListRequest request) {
        Long userId = extractUserId(authentication);
        kanjiListService.addKanjiToList(userId, listId, request.getKanjiId());
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Đã thêm Kanji vào list thành công.",
                "data", Map.of("kanjiListId", listId, "kanjiId", request.getKanjiId())
        ));
    }

    @GetMapping("/api/me/kanji-list/{listId}/items")
    public KanjiListDetailResponse getListDetails(
            Authentication authentication,
            @PathVariable Long listId,
            @RequestParam(defaultValue = "1") long page,
            @RequestParam(defaultValue = "10") int size) {
        Long userId = extractUserId(authentication);
        return kanjiListService.getListDetails(userId, listId, page, size);
    }

    // GET /api/me/kanji-list/{listId}/review/session?batchSize=5
    @GetMapping("/api/me/kanji-list/{listId}/review/session")
    public KanjiReviewSessionResponse getReviewSession(
            Authentication authentication,
            @PathVariable Long listId,
            @RequestParam(defaultValue = "10") int batchSize) {
        Long userId = extractUserId(authentication);
        return kanjiListService.getReviewSession(userId, listId, batchSize);
    }

    // POST /api/me/kanji-list/review/explain
    @PostMapping("/api/me/kanji-list/review/explain")
    public ResponseEntity<ResponseBodyEmitter> explainReviewAnswer(
            Authentication authentication,
            @Valid @RequestBody KanjiExplainRequest request) {
        Long userId = extractUserId(authentication);
        ResponseBodyEmitter emitter = kanjiListService.explainReviewAnswer(userId, request);
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_PLAIN)
                .header("X-Content-Type-Options", "nosniff")
                .header("Cache-Control", "no-cache")
                .body(emitter);
    }

    private Long extractUserId(Authentication authentication) {
        return authentication != null && authentication.getPrincipal() instanceof Long principal
                ? principal
                : null;
    }
}
