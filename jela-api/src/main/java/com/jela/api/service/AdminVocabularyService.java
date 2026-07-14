package com.jela.api.service;

import com.jela.api.dto.request.*;
import com.jela.api.dto.response.*;

public interface AdminVocabularyService {
    AdminVocabularyListResponse getVocabularyList(
            String keyword,
            String level,
            String status,
            String sortBy,
            String sortOrder,
            int page,
            int limit
    );

    AdminVocabularyDetailResponse getVocabularyById(Long id);

    AdminVocabularyDetailResponse createVocabulary(AdminCreateVocabularyRequest request);

    AdminVocabularyDetailResponse updateVocabulary(Long id, AdminUpdateVocabularyRequest request);

    AdminVocabularyDetailResponse updateVocabularyStatus(Long id, AdminUpdateVocabularyStatusRequest request);

    void deleteVocabulary(Long id);

    java.util.Map<String, Object> checkVocabularyExists(String word, String kana);
}
