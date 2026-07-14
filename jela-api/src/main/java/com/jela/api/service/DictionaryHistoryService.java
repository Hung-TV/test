package com.jela.api.service;

import com.jela.api.dto.response.DictionaryHistoryResponse;

public interface DictionaryHistoryService {
    DictionaryHistoryResponse getHistory(Long userId, long page);
}
