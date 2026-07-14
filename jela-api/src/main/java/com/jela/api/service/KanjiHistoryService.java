package com.jela.api.service;

import com.jela.api.dto.response.KanjiHistoryResponse;

public interface KanjiHistoryService {

    KanjiHistoryResponse getHistory(Long userId, long page);

    void deleteHistory(Long userId, Long kanjiId);
}
