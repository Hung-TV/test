package com.jela.api.service.impl;

import com.jela.api.client.AiServiceClient;
import com.jela.api.dto.request.VocabularyExplainRequest;
import com.jela.api.dto.request.VocabularyReviewRequest;
import com.jela.api.dto.response.DictionaryDetailResponse;
import com.jela.api.dto.response.DictionaryListDetailResponse;
import com.jela.api.dto.response.DictionaryListSummaryResponse;
import com.jela.api.dto.response.VocabularyLearnSessionResponse;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyEmitter;
import com.jela.api.dto.response.VocabularyReviewResultResponse;
import com.jela.api.dto.response.VocabularyReviewSessionResponse;
import com.jela.api.entity.Dictionary;
import com.jela.api.entity.UserDictionaryList;
import com.jela.api.entity.UserDictionaryProgress;
import com.jela.api.enums.VocabularyLearningStatus;
import com.jela.api.exception.ApiException;
import com.jela.api.repository.DictionaryRepository;
import com.jela.api.repository.UserDictionaryListRepository;
import com.jela.api.repository.UserDictionaryProgressRepository;
import com.jela.api.repository.UserRepository;
import com.jela.api.service.UserDictionaryListService;
import com.jela.api.service.UserService;
import com.jela.api.util.SpacedRepetitionCalculator;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserDictionaryListServiceImpl implements UserDictionaryListService {

    private final DictionaryRepository dictionaryRepository;
    private final UserDictionaryListRepository userDictionaryListRepository;
    private final UserDictionaryProgressRepository progressRepository;
    private final UserRepository userRepository;
    private final AiServiceClient aiServiceClient;
    private final UserService userService;

    private long numberToLong(Number number) {
        return number == null ? 0L : number.longValue();
    }

    @Override
    @Transactional
    public DictionaryListSummaryResponse createList(Long userId, String name) {
        if (userId == null) throw new ApiException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        if (name == null || name.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "List name must not be blank");
        }
        String normalizedName = name.trim();
        if (normalizedName.length() > 100) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "List name must not exceed 100 characters");
        }

        if (userDictionaryListRepository.existsByUserUserIdAndListName(userId, normalizedName)) {
            throw new ApiException(HttpStatus.CONFLICT, "Danh sách học từ vựng với tên này đã tồn tại");
        }

        UserDictionaryList newList = UserDictionaryList.builder()
                .user(userRepository.getReferenceById(userId))
                .listName(normalizedName)
                .build();

        UserDictionaryList savedList = userDictionaryListRepository.save(newList);
        return DictionaryListSummaryResponse.builder()
                .id(savedList.getListId())
                .name(savedList.getListName())
                .wordCount(0L)
                .dueCount(0L)
                .masteredCount(0L)
                .newCount(0L)
                .learningCount(0L)
                .completed(false)
                .updatedAt(savedList.getUpdatedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DictionaryListSummaryResponse> getAllLists(Long userId) {
        if (userId == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }

        Instant now = Instant.now();
        return userDictionaryListRepository.findAllSummariesByUserId(userId, now).stream()
                .map(row -> {
                    long wordCount = numberToLong(row.getWordCount());
                    long masteredCount = numberToLong(row.getMasteredCount());
                    return DictionaryListSummaryResponse.builder()
                            .id(row.getId())
                            .name(row.getName())
                            .wordCount(wordCount)
                            .dueCount(numberToLong(row.getDueCount()))
                            .masteredCount(masteredCount)
                            .newCount(numberToLong(row.getNewCount()))
                            .learningCount(numberToLong(row.getLearningCount()))
                            .completed(wordCount > 0 && masteredCount == wordCount)
                            .updatedAt(row.getUpdatedAt())
                            .build();
                })
                .toList();
    }

    @Override
    @Transactional
    public void addWordToList(Long userId, Long listId, Long wordId) {
        if (userId == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        if (listId == null || wordId == null || listId <= 0 || wordId <= 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "List ID or word ID is invalid");
        }

        boolean isOwner = userDictionaryListRepository.existsByListIdAndUserId(listId, userId);
        if (!isOwner) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You do not have permission to modify this list");
        }

        if (!dictionaryRepository.existsById(wordId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Dictionary word not found");
        }

        boolean alreadyExists = userDictionaryListRepository.existsWordInList(listId, wordId);
        if (alreadyExists) {
            throw new ApiException(HttpStatus.CONFLICT, "Từ này đã có trong danh sách");
        }

        int insertedRows = userDictionaryListRepository.addWordToList(listId, wordId);
        if (insertedRows > 0) {
            userDictionaryListRepository.touchList(listId);
        } else {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to add word to the list");
        }
    }

    @Override
    @Transactional
    public void addWordToNewList(Long userId, String listName, Long wordId) {
        if (userId == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        if (listName == null || listName.isBlank() || wordId == null || wordId <= 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "List name or word ID is invalid");
        }

        String normalizedListName = listName.trim();
        if (normalizedListName.length() > 100) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "List name must not exceed 100 characters");
        }

        if (!dictionaryRepository.existsById(wordId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Dictionary word not found");
        }

        if (userDictionaryListRepository.existsByUserUserIdAndListName(userId, normalizedListName)) {
            throw new ApiException(HttpStatus.CONFLICT, "Danh sách học từ vựng với tên này đã tồn tại");
        }

        UserDictionaryList newList = UserDictionaryList.builder()
                .user(userRepository.getReferenceById(userId))
                .listName(normalizedListName)
                .build();

        UserDictionaryList savedList = userDictionaryListRepository.saveAndFlush(newList);
        int insertedRows = userDictionaryListRepository.addWordToList(savedList.getListId(), wordId);
        if (insertedRows <= 0) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to add word to the new list");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public DictionaryListDetailResponse getListDetails(Long userId, Long listId, long page, int size) {
        if (userId == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        if (listId == null || listId <= 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "List ID is invalid");
        }
        if (page < 1 || size < 1) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Page and size must be positive");
        }

        UserDictionaryList list = userDictionaryListRepository.findById(listId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Dictionary list not found"));

        if (!list.getUser().getUserId().equals(userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You do not have permission to view this list");
        }

        long totalRecords = userDictionaryListRepository.countWordsByListId(listId);
        int totalPages = (int) Math.ceil((double) totalRecords / size);
        if (totalPages < 1) totalPages = 1;

        long offset = (page - 1) * size;
        List<UserDictionaryListRepository.DictionaryListWordRow> rows = userDictionaryListRepository
                .findWordsByListIdPaginated(listId, size, offset);

        List<DictionaryListDetailResponse.WordSummary> words = rows.stream()
                .map(row -> new DictionaryListDetailResponse.WordSummary(row.getId(), row.getKanji(), row.getHiragana()))
                .toList();

        return DictionaryListDetailResponse.builder()
                .listId(list.getListId())
                .listName(list.getListName())
                .words(words)
                .totalRecords(totalRecords)
                .totalPages(totalPages)
                .build();
    }

    @Override
    @Transactional
    public VocabularyLearnSessionResponse getLearnSessionByList(Long userId, Long listId, int batchSize) {
        if (userId == null) throw new ApiException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        validateOwnedList(userId, listId);

        long totalCount = userDictionaryListRepository.countWordsByListId(listId);
        if (batchSize < 1 || batchSize > 20) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Batch size must be between 1 and 20");
        }

        int effectiveBatchSize = (int) Math.min((long) batchSize, totalCount);
        if (effectiveBatchSize == 0) {
            return new VocabularyLearnSessionResponse("NEW", 0, 0, List.of(), List.of());
        }

        Instant now = Instant.now();

        // 1. Fetch due reviews
        List<UserDictionaryProgress> due = progressRepository.findDueReviewsByList(
                userId, listId, now, PageRequest.of(0, effectiveBatchSize));

        List<VocabularyLearnSessionResponse.LearnItem> dueItems = buildLearnItems(due, true);
        int reviewCount = dueItems.size();

        // 2. Fetch new words (unprogressed)
        int remaining = effectiveBatchSize - dueItems.size();
        List<VocabularyLearnSessionResponse.LearnItem> newItems = new ArrayList<>();
        int newCount = 0;
        if (remaining > 0) {
            List<Long> newWordIds = progressRepository.findUnprogressedWordIds(userId, listId, remaining);
            if (!newWordIds.isEmpty()) {
                newItems = buildLearnItemsFromIds(newWordIds, false);
                newCount += newItems.size();
            }
        }

        // 3. Fetch fallback reviews if there is still a deficit
        int deficit = effectiveBatchSize - (dueItems.size() + newItems.size());
        List<VocabularyLearnSessionResponse.LearnItem> fallbackItems = new ArrayList<>();
        if (deficit > 0) {
            List<Long> excludedIds = new ArrayList<>();
            due.forEach(p -> excludedIds.add(p.getDictionary().getDictionaryId()));
            newItems.forEach(item -> excludedIds.add(item.id()));

            List<UserDictionaryProgress> fallback;
            if (excludedIds.isEmpty()) {
                fallback = progressRepository.findFallbackReviewsByList(
                        userId, listId, PageRequest.of(0, deficit));
            } else {
                fallback = progressRepository.findFallbackReviewsByListExcluding(
                        userId, listId, excludedIds, PageRequest.of(0, deficit));
            }
            fallbackItems = buildLearnItems(fallback, true);
            reviewCount += fallbackItems.size();
        }

        List<VocabularyLearnSessionResponse.LearnItem> allItems = new ArrayList<>();
        allItems.addAll(dueItems);
        allItems.addAll(newItems);
        allItems.addAll(fallbackItems);

        List<Map<String, Object>> quizInput = buildQuizInput(allItems);

        List<VocabularyReviewSessionResponse.QuizQuestion> questions = List.of();
        if (!quizInput.isEmpty()) {
            questions = aiServiceClient.generateVocabularyQuestions(quizInput);
        }

        String sessionType = reviewCount == 0 ? "NEW" : (newCount == 0 ? "REVIEW" : "MIXED");
        return new VocabularyLearnSessionResponse(sessionType, reviewCount, newCount, allItems, questions);
    }

    @Override
    @Transactional
    public VocabularyReviewResultResponse submitReview(Long userId, Long listId, VocabularyReviewRequest request) {
        if (userId == null) throw new ApiException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        if (listId == null || listId <= 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "List ID is required");
        }
        if (request.getReviews() == null || request.getReviews().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Reviews list must not be empty");
        }
        validateOwnedList(userId, listId);

        Instant now = Instant.now();
        List<VocabularyReviewResultResponse.ReviewResult> results = new ArrayList<>();

        for (VocabularyReviewRequest.ReviewItem item : request.getReviews()) {
            if (!userDictionaryListRepository.existsWordInList(listId, item.getDictionaryId())) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Word is not in the selected list: " + item.getDictionaryId());
            }

            UserDictionaryProgress progress = progressRepository
                    .findByUserIdAndDictionaryDictionaryId(userId, item.getDictionaryId())
                    .orElseGet(() -> {
                        Dictionary dictionary = dictionaryRepository.findById(item.getDictionaryId())
                                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND,
                                        "Dictionary word not found: " + item.getDictionaryId()));
                        return UserDictionaryProgress.builder()
                                .userId(userId)
                                .dictionary(dictionary)
                                .status(VocabularyLearningStatus.LEARNING)
                                .currentStep(0)
                                .repetitions(0)
                                .build();
                    });

            boolean isFallback = progress.getNextReviewAt() != null && progress.getNextReviewAt().isAfter(now);

            if (isFallback) {
                progress.setLastQuality(item.getQuality());
                progress.setLastReviewedAt(now);
                progressRepository.save(progress);
            } else {
                applyEbbinghaus(progress, item.getQuality(), now);
                progressRepository.save(progress);
            }

            int intervalDays = SpacedRepetitionCalculator.EBBINGHAUS_INTERVALS[progress.getCurrentStep()];
            results.add(new VocabularyReviewResultResponse.ReviewResult(
                    item.getDictionaryId(),
                    progress.getStatus().name(),
                    progress.getNextReviewAt(),
                    intervalDays
            ));
        }

        userDictionaryListRepository.touchList(listId);
        userService.updateStreak(userId);

        return new VocabularyReviewResultResponse("success", results);
    }

    @Override
    @Transactional(readOnly = true)
    public VocabularyReviewSessionResponse getReviewSession(Long userId, Long listId, int batchSize) {
        if (userId == null) throw new ApiException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        validateOwnedList(userId, listId);

        long totalCount = userDictionaryListRepository.countWordsByListId(listId);
        int effectiveBatchSize = (int) Math.min((long) batchSize, totalCount);
        if (effectiveBatchSize == 0) {
            return new VocabularyReviewSessionResponse(List.of());
        }

        Instant now = Instant.now();
        List<UserDictionaryProgress> due = progressRepository.findDueReviewsByList(
                userId, listId, now, PageRequest.of(0, effectiveBatchSize));

        if (due.isEmpty()) {
            due = progressRepository.findFallbackReviewsByList(
                    userId, listId, PageRequest.of(0, effectiveBatchSize));
        }

        if (due.isEmpty()) {
            return new VocabularyReviewSessionResponse(List.of());
        }

        List<VocabularyLearnSessionResponse.LearnItem> dueItems = buildLearnItems(due, true);
        List<Map<String, Object>> items = buildQuizInput(dueItems);

        List<VocabularyReviewSessionResponse.QuizQuestion> questions = aiServiceClient.generateVocabularyQuestions(items);
        return new VocabularyReviewSessionResponse(questions);
    }

    private List<Map<String, Object>> buildQuizInput(List<VocabularyLearnSessionResponse.LearnItem> items) {
        return items.stream()
                .map(item -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("dictionaryId", item.id());
                    map.put("word", item.kanji() != null && !item.kanji().isBlank() ? item.kanji() : item.hiragana());
                    map.put("hiragana", item.hiragana());

                    String meaning = "";
                    List<Map<String, String>> exList = new ArrayList<>();
                    if (item.meanings() != null && !item.meanings().isEmpty()) {
                        var firstMeaning = item.meanings().get(0);
                        meaning = firstMeaning.gloss();

                        if (firstMeaning.example() != null) {
                            for (var ex : firstMeaning.example()) {
                                if (ex.sentenceJP() != null && !ex.sentenceJP().isBlank()) {
                                    Map<String, String> exMap = new LinkedHashMap<>();
                                    exMap.put("sentenceJp", ex.sentenceJP());
                                    exMap.put("sentenceVi", ex.sentenceVI());
                                    exList.add(exMap);
                                }
                            }
                        }
                    }
                    map.put("meaning", meaning);
                    map.put("examples", exList);
                    return map;
                })
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseBodyEmitter explainReviewAnswer(Long userId, VocabularyExplainRequest request) {
        if (userId == null) throw new ApiException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        enrichVocabExplainRequest(request);
        return aiServiceClient.explainVocabularyAnswer(request);
    }

    private void enrichVocabExplainRequest(VocabularyExplainRequest request) {
        try {
            // 1. Enrich correct word details
            Long correctId = dictionaryRepository.findFirstIdByWord(request.getCorrectWord());
            if (correctId != null) {
                List<DictionaryRepository.DictionaryDetailRow> rows = dictionaryRepository.findDetailRowsById(correctId);
                if (!rows.isEmpty()) {
                    request.setCorrectHiragana(rows.get(0).getHiragana());
                    String correctGlosses = rows.stream()
                            .map(DictionaryRepository.DictionaryDetailRow::getGloss)
                            .filter(java.util.Objects::nonNull)
                            .distinct()
                            .collect(Collectors.joining(", "));
                    request.setCorrectMeaning(correctGlosses);
                }
            }

            // 2. Enrich selected (wrong) word details
            String qType = request.getQuestionType();
            if ("VOCAB_TO_MEANING".equals(qType) || "CONTEXT_CLOZE".equals(qType)) {
                // In these question types, request.selectedWord is the Vietnamese meaning description selected by the user.
                request.setSelectedMeaning(request.getSelectedWord());
                // We keep request.selectedWord as is (the selected meaning string).
            } else {
                // For MEANING_TO_VOCAB and KANA_TO_KANJI, request.selectedWord is the Japanese word itself.
                Long selectedId = dictionaryRepository.findFirstIdByWord(request.getSelectedWord());
                if (selectedId != null) {
                    List<DictionaryRepository.DictionaryDetailRow> rows = dictionaryRepository.findDetailRowsById(selectedId);
                    if (!rows.isEmpty()) {
                        String selectedGlosses = rows.stream()
                                .map(DictionaryRepository.DictionaryDetailRow::getGloss)
                                .filter(java.util.Objects::nonNull)
                                .distinct()
                                .collect(Collectors.joining(", "));
                        request.setSelectedMeaning(selectedGlosses);
                    }
                }
            }
        } catch (Exception e) {
            // Keep original values on error
            System.err.println("Error enriching vocabulary explain request: " + e.getMessage());
        }
    }

    private List<VocabularyLearnSessionResponse.LearnItem> buildLearnItemsFromIds(List<Long> wordIds, boolean isReview) {
        if (wordIds.isEmpty()) {
            return List.of();
        }

        List<DictionaryRepository.DictionaryDetailRow> rows = dictionaryRepository.findDetailRowsByIds(wordIds);

        Map<Long, List<DictionaryRepository.DictionaryDetailRow>> rowsByWordId = rows.stream()
                .collect(Collectors.groupingBy(DictionaryRepository.DictionaryDetailRow::getId));

        List<VocabularyLearnSessionResponse.LearnItem> resultList = new ArrayList<>();

        class TempMeaning {
            final Long meaningId;
            final String pos;
            final String gloss;
            final String xref;
            final List<DictionaryDetailResponse.ExampleResponse> examples = new ArrayList<>();

            TempMeaning(Long id, String pos, String gloss, String xref) {
                this.meaningId = id;
                this.pos = pos;
                this.gloss = gloss;
                this.xref = xref;
            }
        }

        for (Long wordId : wordIds) {
            List<DictionaryRepository.DictionaryDetailRow> wordRows = rowsByWordId.get(wordId);
            if (wordRows == null || wordRows.isEmpty()) {
                continue;
            }

            DictionaryRepository.DictionaryDetailRow firstRow = wordRows.get(0);
            Map<Long, TempMeaning> tempMeanings = new LinkedHashMap<>();

            for (var row : wordRows) {
                if (row.getMeaningId() == null) {
                    continue;
                }

                TempMeaning m = tempMeanings.computeIfAbsent(row.getMeaningId(), id ->
                        new TempMeaning(id, row.getPos(), row.getGloss(), row.getXref())
                );

                if (row.getExId() != null) {
                    m.examples.add(DictionaryDetailResponse.ExampleResponse.builder()
                            .exId(row.getExId())
                            .exTest(row.getExTest())
                            .sentenceJP(row.getSentenceJP())
                            .sentenceVI(row.getSentenceVI())
                            .build());
                }
            }

            List<DictionaryDetailResponse.MeaningDetailResponse> meanings = tempMeanings.values().stream()
                    .map(m -> DictionaryDetailResponse.MeaningDetailResponse.builder()
                            .meaningId(m.meaningId)
                            .pos(m.pos)
                            .gloss(m.gloss)
                            .xref(m.xref)
                            .example(m.examples)
                            .build())
                    .toList();

            resultList.add(new VocabularyLearnSessionResponse.LearnItem(
                    wordId,
                    firstRow.getKanji(),
                    firstRow.getHiragana(),
                    meanings,
                    isReview
            ));
        }

        return resultList;
    }

    private List<VocabularyLearnSessionResponse.LearnItem> buildLearnItems(List<UserDictionaryProgress> progressList, boolean isReview) {
        if (progressList.isEmpty()) {
            return List.of();
        }
        List<Long> wordIds = progressList.stream()
                .map(p -> p.getDictionary().getDictionaryId())
                .toList();
        return buildLearnItemsFromIds(wordIds, isReview);
    }

    private void applyEbbinghaus(UserDictionaryProgress progress, int quality, Instant now) {
        int step = progress.getCurrentStep() != null ? progress.getCurrentStep() : 0;
        int reps = progress.getRepetitions() != null ? progress.getRepetitions() : 0;

        SpacedRepetitionCalculator.SRSResult srsResult = SpacedRepetitionCalculator.calculateNext(step, reps, quality, now);

        progress.setCurrentStep(srsResult.newStep());
        progress.setRepetitions(srsResult.newRepetitions());
        progress.setLastQuality(quality);
        progress.setLastReviewedAt(now);
        progress.setNextReviewAt(srsResult.nextReviewAt());
        progress.setStatus(VocabularyLearningStatus.valueOf(srsResult.status()));
    }

    private void validateOwnedList(Long userId, Long listId) {
        if (listId == null || listId <= 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid list ID");
        }
        if (!userDictionaryListRepository.existsByListIdAndUserId(listId, userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You do not have permission to modify this list");
        }
    }
}
