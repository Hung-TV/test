package com.jela.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateDictionaryListRequest {

    @NotBlank
    @Size(max = 100)
    private String name;
}
