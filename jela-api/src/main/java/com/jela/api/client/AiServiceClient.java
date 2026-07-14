package com.jela.api.client;

import com.jela.api.dto.request.KanjiExplainRequest;
import com.jela.api.dto.response.KanjiReviewSessionResponse;
import com.jela.api.dto.request.VocabularyExplainRequest;
import com.jela.api.dto.response.VocabularyReviewSessionResponse;
import com.jela.api.exception.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyEmitter;

import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Component
@RequiredArgsConstructor
public class AiServiceClient {

    private final RestTemplate restTemplate = new RestTemplate();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_1_1)
            .build();

    @Value("${app.ai-service.url:http://localhost:8000}")
    private String aiServiceUrl;

    public List<KanjiReviewSessionResponse.QuizQuestion> generateQuestions(List<Map<String, Object>> items) {
        String url = aiServiceUrl + "/api/ai/quiz/generate";
        Map<String, Object> requestBody = Map.of("items", items);

        try {
            ResponseEntity<KanjiReviewSessionResponse.QuizQuestion[]> response = restTemplate.postForEntity(
                    url, requestBody, KanjiReviewSessionResponse.QuizQuestion[].class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return List.of(response.getBody());
            }
        } catch (Exception e) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Không thể kết nối đến dịch vụ AI Local: " + e.getMessage());
        }

        throw new ApiException(HttpStatus.BAD_GATEWAY, "Dịch vụ AI Local trả về lỗi khi sinh câu hỏi");
    }

    public ResponseBodyEmitter explainAnswer(KanjiExplainRequest request) {
        String url = aiServiceUrl + "/api/ai/quiz/explain";
        ResponseBodyEmitter emitter = new ResponseBodyEmitter();

        CompletableFuture.runAsync(() -> {
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                String requestBody = mapper.writeValueAsString(request);

                HttpRequest httpRequest = HttpRequest.newBuilder()
                        .uri(URI.create(url))
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                        .build();

                HttpResponse<InputStream> httpResponse = httpClient.send(
                        httpRequest,
                        HttpResponse.BodyHandlers.ofInputStream()
                );

                try (InputStream body = httpResponse.body()) {
                    byte[] buffer = new byte[256];
                    int bytesRead;
                    while ((bytesRead = body.read(buffer)) != -1) {
                        String chunk = new String(buffer, 0, bytesRead, java.nio.charset.StandardCharsets.UTF_8);
                        emitter.send(chunk);
                    }
                    emitter.complete();
                }
            } catch (Exception e) {
                try {
                    emitter.send("[Không thể kết nối đến dịch vụ AI: " + e.getMessage() + "]");
                    emitter.complete();
                } catch (Exception ignored) {}
            }
        });

        return emitter;
    }

    public List<VocabularyReviewSessionResponse.QuizQuestion> generateVocabularyQuestions(List<Map<String, Object>> items) {
        String url = aiServiceUrl + "/api/ai/vocab-quiz/generate";
        Map<String, Object> requestBody = Map.of("items", items);

        try {
            ResponseEntity<VocabularyReviewSessionResponse.QuizQuestion[]> response = restTemplate.postForEntity(
                    url, requestBody, VocabularyReviewSessionResponse.QuizQuestion[].class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return List.of(response.getBody());
            }
        } catch (Exception e) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Không thể kết nối đến dịch vụ AI Local: " + e.getMessage());
        }

        throw new ApiException(HttpStatus.BAD_GATEWAY, "Dịch vụ AI Local trả về lỗi khi sinh câu hỏi từ vựng");
    }

    public ResponseBodyEmitter explainVocabularyAnswer(VocabularyExplainRequest request) {
        String url = aiServiceUrl + "/api/ai/vocab-quiz/explain";
        ResponseBodyEmitter emitter = new ResponseBodyEmitter();

        CompletableFuture.runAsync(() -> {
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                String requestBody = mapper.writeValueAsString(request);

                HttpRequest httpRequest = HttpRequest.newBuilder()
                        .uri(URI.create(url))
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                        .build();

                HttpResponse<InputStream> httpResponse = httpClient.send(
                        httpRequest,
                        HttpResponse.BodyHandlers.ofInputStream()
                );

                try (InputStream body = httpResponse.body()) {
                    byte[] buffer = new byte[256];
                    int bytesRead;
                    while ((bytesRead = body.read(buffer)) != -1) {
                        String chunk = new String(buffer, 0, bytesRead, java.nio.charset.StandardCharsets.UTF_8);
                        emitter.send(chunk);
                    }
                    emitter.complete();
                }
            } catch (Exception e) {
                try {
                    emitter.send("[Không thể kết nối đến dịch vụ AI: " + e.getMessage() + "]");
                    emitter.complete();
                } catch (Exception ignored) {}
            }
        });

        return emitter;
    }
}
