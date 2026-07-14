package com.jela.api.service;

import com.jela.api.dto.response.KanjiDetailResponse;
import com.jela.api.dto.response.KanjiLevelResponse;
import com.jela.api.dto.response.KanjiSearchResponse;
import com.jela.api.dto.response.KanjiSummaryResponse;
import org.springframework.data.domain.Page;

import java.util.List;

public interface KanjiService {

    List<KanjiLevelResponse> getLevels(Long userId);

    Page<KanjiSummaryResponse> getKanjiByLevel(String level, int page);

    List<KanjiSearchResponse> search(String searchKey);

    KanjiDetailResponse getDetail(Long kanjiId, Long userId);
}
