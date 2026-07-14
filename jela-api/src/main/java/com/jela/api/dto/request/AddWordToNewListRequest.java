package com.jela.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AddWordToNewListRequest {
    @NotNull
    @NotBlank
    @Size(max = 100)
    private String listName;

    @NotNull
    @Positive
    private Long wordId;
}
