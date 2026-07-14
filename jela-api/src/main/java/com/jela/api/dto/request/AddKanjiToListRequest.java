package com.jela.api.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class AddKanjiToListRequest {

    @NotNull
    @Positive
    private Long kanjiId;
}
