package com.jela.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class KanjiExplainRequest {
    @NotBlank
    private String correctCharacter;
    @NotBlank
    private String selectedCharacter;
}
