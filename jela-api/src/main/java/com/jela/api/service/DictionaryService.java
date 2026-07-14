package com.jela.api.service;

import com.jela.api.dto.response.DictionarySearchResponse;
import com.jela.api.dto.response.DictionaryDetailResponse;

import java.util.List;

public interface DictionaryService {
    List<DictionarySearchResponse> search(String searchKey);
    DictionaryDetailResponse searchId(Long userId, Long wordId);
}
