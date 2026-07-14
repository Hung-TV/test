package com.jela.api.service;

import com.jela.api.dto.request.VocabularyExplainRequest;
import com.jela.api.dto.request.VocabularyReviewRequest;
import com.jela.api.dto.response.DictionaryListDetailResponse;
import com.jela.api.dto.response.DictionaryListSummaryResponse;
import com.jela.api.dto.response.VocabularyLearnSessionResponse;
import com.jela.api.dto.response.VocabularyReviewResultResponse;
import com.jela.api.dto.response.VocabularyReviewSessionResponse;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyEmitter;

import java.util.List;

public interface UserDictionaryListService {
    DictionaryListSummaryResponse createList(Long userId, String name);
    List<DictionaryListSummaryResponse> getAllLists(Long userId);
    void addWordToList(Long userId, Long listId, Long wordId);
    void addWordToNewList(Long userId, String listName, Long wordId);
    DictionaryListDetailResponse getListDetails(Long userId, Long listId, long page, int size);
    VocabularyLearnSessionResponse getLearnSessionByList(Long userId, Long listId, int batchSize);
    VocabularyReviewResultResponse submitReview(Long userId, Long listId, VocabularyReviewRequest request);
    VocabularyReviewSessionResponse getReviewSession(Long userId, Long listId, int batchSize);
    ResponseBodyEmitter explainReviewAnswer(Long userId, VocabularyExplainRequest request);
}
