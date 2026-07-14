package com.jela.api.service;

import com.jela.api.dto.request.*;
import com.jela.api.dto.response.*;

public interface AdminKanjiService {
    AdminKanjiListResponse getKanjiList(
            String keyword,
            String level,
            String status,
            String sortBy,
            String sortOrder,
            int page,
            int limit
    );

    AdminKanjiDetailResponse getKanjiById(Long id);

    AdminKanjiDetailResponse createKanji(AdminCreateKanjiRequest request);

    AdminKanjiDetailResponse updateKanji(Long id, AdminUpdateKanjiRequest request);

    AdminKanjiDetailResponse updateKanjiStatus(Long id, AdminUpdateKanjiStatusRequest request);

    void deleteKanji(Long id);

    java.util.Map<String, Object> checkKanjiExists(String character);
}
