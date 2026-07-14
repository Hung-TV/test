package com.jela.api.controller;

import com.jela.api.dto.request.AddWordToListRequest;
import com.jela.api.dto.request.AddWordToNewListRequest;
import com.jela.api.dto.request.CreateDictionaryListRequest;
import com.jela.api.dto.request.VocabularyExplainRequest;
import com.jela.api.dto.request.VocabularyReviewRequest;
import com.jela.api.dto.response.DictionaryListDetailResponse;
import com.jela.api.dto.response.DictionaryListSummaryResponse;
import com.jela.api.dto.response.VocabularyLearnSessionResponse;
import com.jela.api.dto.response.VocabularyReviewResultResponse;
import com.jela.api.dto.response.VocabularyReviewSessionResponse;
import com.jela.api.service.UserDictionaryListService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyEmitter;

import java.util.List;

@RestController
@RequestMapping("/api/me/dictionary-lists")
@RequiredArgsConstructor
public class UserDictionaryListController {

    private final UserDictionaryListService userDictionaryListService;

    @PostMapping("/create")
    public ResponseEntity<DictionaryListSummaryResponse> createList(
            Authentication authentication,
            @Valid @RequestBody CreateDictionaryListRequest request) {
        Long userId = authentication != null && authentication.getPrincipal() instanceof Long principal
                ? principal
                : null;
        DictionaryListSummaryResponse created = userDictionaryListService.createList(userId, request.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/all")
    public List<DictionaryListSummaryResponse> getAllLists(Authentication authentication) {
        Long userId = authentication != null && authentication.getPrincipal() instanceof Long principal
                ? principal
                : null;
        return userDictionaryListService.getAllLists(userId);
    }

    @PutMapping("/add-word")
    public void addToList(Authentication authentication, @Valid @RequestBody AddWordToListRequest request) {
        Long userId = authentication != null && authentication.getPrincipal() instanceof Long principal
                ? principal
                : null;
        userDictionaryListService.addWordToList(userId, request.getListId(), request.getWordId());
    }

    @PutMapping("/add-word-to-new-list")
    public void addToNewList(Authentication authentication, @Valid @RequestBody AddWordToNewListRequest request) {
        Long userId = authentication != null && authentication.getPrincipal() instanceof Long principal
                ? principal
                : null;
        userDictionaryListService.addWordToNewList(userId, request.getListName(), request.getWordId());
    }

    @GetMapping("/{listId}/items")
    public DictionaryListDetailResponse getListDetails(
            Authentication authentication,
            @PathVariable Long listId,
            @RequestParam(defaultValue = "1") long page,
            @RequestParam(defaultValue = "10") int size) {
        Long userId = authentication != null && authentication.getPrincipal() instanceof Long principal
                ? principal
                : null;
        return userDictionaryListService.getListDetails(userId, listId, page, size);
    }

    @GetMapping("/{listId}/learn/session")
    public VocabularyLearnSessionResponse getLearnSession(
            Authentication authentication,
            @PathVariable Long listId,
            @RequestParam(defaultValue = "10") int batchSize) {
        Long userId = authentication != null && authentication.getPrincipal() instanceof Long principal
                ? principal
                : null;
        return userDictionaryListService.getLearnSessionByList(userId, listId, batchSize);
    }

    @PostMapping("/{listId}/review")
    public VocabularyReviewResultResponse submitReview(
            Authentication authentication,
            @PathVariable Long listId,
            @Valid @RequestBody VocabularyReviewRequest request) {
        Long userId = authentication != null && authentication.getPrincipal() instanceof Long principal
                ? principal
                : null;
        return userDictionaryListService.submitReview(userId, listId, request);
    }

    @GetMapping("/{listId}/review/session")
    public VocabularyReviewSessionResponse getReviewSession(
            Authentication authentication,
            @PathVariable Long listId,
            @RequestParam(defaultValue = "10") int batchSize) {
        Long userId = authentication != null && authentication.getPrincipal() instanceof Long principal
                ? principal
                : null;
        return userDictionaryListService.getReviewSession(userId, listId, batchSize);
    }

    @PostMapping("/review/explain")
    public ResponseEntity<ResponseBodyEmitter> explainReviewAnswer(
            Authentication authentication,
            @Valid @RequestBody VocabularyExplainRequest request) {
        Long userId = authentication != null && authentication.getPrincipal() instanceof Long principal
                ? principal
                : null;
        ResponseBodyEmitter emitter = userDictionaryListService.explainReviewAnswer(userId, request);
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_PLAIN)
                .header("X-Content-Type-Options", "nosniff")
                .header("Cache-Control", "no-cache")
                .body(emitter);
    }
}
