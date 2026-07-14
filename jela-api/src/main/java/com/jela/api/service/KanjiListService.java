package com.jela.api.service;

import com.jela.api.dto.request.KanjiReviewRequest;
import com.jela.api.dto.response.KanjiLearnSessionResponse;
import com.jela.api.dto.response.KanjiLearningListResponse;
import com.jela.api.dto.response.KanjiListLearnSummaryResponse;
import com.jela.api.dto.response.KanjiListSummaryResponse;
import com.jela.api.dto.response.KanjiReviewResultResponse;
import com.jela.api.dto.response.KanjiListDetailResponse;

import com.jela.api.dto.response.KanjiReviewSessionResponse;
import com.jela.api.dto.request.KanjiExplainRequest;

import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyEmitter;

import java.util.List;

public interface KanjiListService {

    List<KanjiListLearnSummaryResponse> getUserLists(Long userId);

    KanjiListSummaryResponse createList(Long userId, String name);

    KanjiLearningListResponse startLevelList(Long userId, String level);

    KanjiLearnSessionResponse getLearnSessionByList(Long userId, Long listId, int batchSize);

    KanjiReviewResultResponse submitReview(Long userId, Long listId, KanjiReviewRequest request);

    void addKanjiToList(Long userId, Long kanjiListId, Long kanjiId);

    KanjiListDetailResponse getListDetails(Long userId, Long listId, long page, int size);

    KanjiReviewSessionResponse getReviewSession(Long userId, Long listId, int batchSize);

    ResponseBodyEmitter explainReviewAnswer(Long userId, KanjiExplainRequest request);
}
