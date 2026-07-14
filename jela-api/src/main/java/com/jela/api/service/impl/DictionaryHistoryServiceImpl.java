package com.jela.api.service.impl;

import com.jela.api.dto.response.DictionaryHistoryResponse;
import com.jela.api.exception.ApiException;
import com.jela.api.repository.DictionaryHistoryRepository;
import com.jela.api.service.DictionaryHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DictionaryHistoryServiceImpl implements DictionaryHistoryService {

    private static final int HISTORY_PAGE_SIZE = 10;

    private final DictionaryHistoryRepository dictionaryHistoryRepository;

    @Override
    @Transactional(readOnly = true)
    public DictionaryHistoryResponse getHistory(Long userId, long page) {
        if (userId == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        if (page < 1) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Page must be positive");
        }

        long offset = (page - 1) * HISTORY_PAGE_SIZE;
        List<DictionaryHistoryResponse.HistoryWordResponse> hisWordList = dictionaryHistoryRepository
                .findHistoryByUserId(userId, HISTORY_PAGE_SIZE, offset)
                .stream()
                .map(row -> new DictionaryHistoryResponse.HistoryWordResponse(
                        row.getId(),
                        row.getKanji(),
                        row.getSearchedAt()
                ))
                .toList();

        long totalRecords = dictionaryHistoryRepository.countHistoryByUserId(userId);
        int totalPages = (int) Math.ceil((double) totalRecords / HISTORY_PAGE_SIZE);
        if (totalPages < 1) totalPages = 1;

        return new DictionaryHistoryResponse(hisWordList, totalRecords, totalPages);
    }
}
