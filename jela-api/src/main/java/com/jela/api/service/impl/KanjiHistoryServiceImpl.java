package com.jela.api.service.impl;

import com.jela.api.dto.response.KanjiHistoryResponse;
import com.jela.api.exception.ApiException;
import com.jela.api.repository.KanjiHistoryRepository;
import com.jela.api.service.KanjiHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class KanjiHistoryServiceImpl implements KanjiHistoryService {

    private static final int HISTORY_PAGE_SIZE = 10;

    private final KanjiHistoryRepository kanjiHistoryRepository;

    @Override
    @Transactional(readOnly = true)
    public KanjiHistoryResponse getHistory(Long userId, long page) {
        if (userId == null) throw new ApiException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        if (page < 1) throw new ApiException(HttpStatus.BAD_REQUEST, "Page must be positive");

        long offset = (page - 1) * HISTORY_PAGE_SIZE;
        List<KanjiHistoryResponse.HistoryKanjiResponse> hisKanjiList = kanjiHistoryRepository
                .findHistoryByUserId(userId, HISTORY_PAGE_SIZE, offset)
                .stream()
                .map(row -> new KanjiHistoryResponse.HistoryKanjiResponse(
                        row.getId(),
                        row.getCharacter(),
                        row.getSearchedAt()
                ))
                .toList();

        long totalRecords = kanjiHistoryRepository.countHistoryByUserId(userId);
        int totalPages = (int) Math.ceil((double) totalRecords / HISTORY_PAGE_SIZE);
        if (totalPages < 1) totalPages = 1;

        return new KanjiHistoryResponse(hisKanjiList, totalRecords, totalPages);
    }

    @Override
    @Transactional
    public void deleteHistory(Long userId, Long kanjiId) {
        if (userId == null) throw new ApiException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        int deleted = kanjiHistoryRepository.deleteByUserIdAndKanjiId(userId, kanjiId);
        if (deleted == 0) {
            throw new ApiException(HttpStatus.NOT_FOUND, "History record not found");
        }
    }
}
