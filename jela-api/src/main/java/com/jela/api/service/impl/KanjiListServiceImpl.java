package com.jela.api.service.impl;

import com.jela.api.dto.request.KanjiReviewRequest;
import com.jela.api.dto.response.KanjiLearnSessionResponse;
import com.jela.api.dto.response.KanjiLearningListResponse;
import com.jela.api.dto.response.KanjiListLearnSummaryResponse;
import com.jela.api.dto.response.KanjiListSummaryResponse;
import com.jela.api.dto.response.KanjiListDetailResponse;
import com.jela.api.dto.response.KanjiReviewResultResponse;
import com.jela.api.client.AiServiceClient;
import com.jela.api.dto.request.KanjiExplainRequest;
import com.jela.api.dto.response.KanjiReviewSessionResponse;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyEmitter;
import com.jela.api.entity.Kanji;
import com.jela.api.entity.UserKanjiList;
import com.jela.api.entity.UserKanjiProgress;
import com.jela.api.enums.KanjiLearningStatus;
import com.jela.api.enums.KanjiListSourceType;
import com.jela.api.exception.ApiException;
import com.jela.api.repository.KanjiRepository;
import com.jela.api.repository.UserKanjiListItemRepository;
import com.jela.api.repository.UserKanjiListRepository;
import com.jela.api.repository.UserKanjiProgressRepository;
import com.jela.api.repository.UserRepository;
import com.jela.api.service.KanjiListService;
import com.jela.api.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import com.jela.api.util.SpacedRepetitionCalculator;


@Service
@RequiredArgsConstructor
public class KanjiListServiceImpl implements KanjiListService {

    private static final List<String> JLPT_LEVELS = List.of("N5", "N4", "N3", "N2", "N1");
    private static final int INITIAL_LIST_SEED_SIZE = 10;
    private static final int MAX_LEARN_BATCH_SIZE = 20;

    private final KanjiRepository kanjiRepository;
    private final UserKanjiListRepository userKanjiListRepository;
    private final UserKanjiListItemRepository userKanjiListItemRepository;
    private final UserKanjiProgressRepository progressRepository;
    private final UserRepository userRepository;
    private final AiServiceClient aiServiceClient;
    private final UserService userService;

    @Override
    @Transactional(readOnly = true)
    public List<KanjiListLearnSummaryResponse> getUserLists(Long userId) {
        if (userId == null) throw new ApiException(HttpStatus.UNAUTHORIZED, "Unauthorized");

        return userKanjiListRepository.findLearnSummariesByUserId(userId, Instant.now()).stream()
                .map(row -> {
                    long totalCount = numberToLong(row.getTotalCount());
                    long masteredCount = numberToLong(row.getMasteredCount());
                    return KanjiListLearnSummaryResponse.builder()
                            .listId(row.getListId())
                            .listName(row.getListName())
                            .sourceType(row.getSourceType())
                            .totalCount(totalCount)
                            .dueCount(numberToLong(row.getDueCount()))
                            .masteredCount(masteredCount)
                            .newCount(numberToLong(row.getNewCount()))
                            .learningCount(numberToLong(row.getLearningCount()))
                            .completed(totalCount > 0 && masteredCount == totalCount)
                            .updatedAt(row.getUpdatedAt())
                            .build();
                })
                .toList();
    }

    @Override
    @Transactional
    public KanjiListSummaryResponse createList(Long userId, String name) {
        if (userId == null) throw new ApiException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        if (name == null || name.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "List name must not be blank");
        }
        String normalizedName = name.trim();
        if (normalizedName.length() > 100) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "List name must not exceed 100 characters");
        }

        if (userKanjiListRepository.existsByUserUserIdAndListName(userId, normalizedName)) {
            throw new ApiException(HttpStatus.CONFLICT, "Danh sách học Hán tự với tên này đã tồn tại");
        }

        UserKanjiList newList = UserKanjiList.builder()
                .user(userRepository.getReferenceById(userId))
                .listName(normalizedName)
                .sourceType(KanjiListSourceType.CUSTOM)
                .build();

        UserKanjiList saved = userKanjiListRepository.saveAndFlush(newList);
        return KanjiListSummaryResponse.builder()
                .id(saved.getListId())
                .name(saved.getListName())
                .sourceType(sourceTypeName(saved))
                .kanjiCount(0L)
                .build();
    }

    @Override
    @Transactional
    public KanjiLearningListResponse startLevelList(Long userId, String level) {
        if (userId == null) throw new ApiException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        validateLevel(level);

        String listName = "JLPT " + level;
        Optional<UserKanjiList> existingList = userKanjiListRepository
                .findByUserUserIdAndSourceTypeAndListName(userId, KanjiListSourceType.JLPT_LEVEL, listName);
        if (existingList.isPresent()) {
            return toLearningListResponse(existingList.get());
        }

        UserKanjiList list = UserKanjiList.builder()
                .user(userRepository.getReferenceById(userId))
                .listName(listName)
                .sourceType(KanjiListSourceType.JLPT_LEVEL)
                .build();
        UserKanjiList saved = userKanjiListRepository.saveAndFlush(list);
        userKanjiListRepository.addKanjiByLevelToList(saved.getListId(), level);
        userKanjiListRepository.touchList(saved.getListId());

        return toLearningListResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public KanjiLearnSessionResponse getLearnSessionByList(Long userId, Long listId, int batchSize) {
        if (userId == null) throw new ApiException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        validateOwnedList(userId, listId);

        long totalCount = userKanjiListItemRepository.countByListListId(listId);
        validateListBatchSize(batchSize);

        int effectiveBatchSize = (int) Math.min((long) batchSize, totalCount);

        Instant now = Instant.now();
        List<UserKanjiProgress> due = progressRepository.findDueReviewsByList(
                userId, listId, now, PageRequest.of(0, effectiveBatchSize));

        List<KanjiLearnSessionResponse.LearnItem> dueItems = due.stream()
                .map(progress -> toLearnItem(progress.getKanji(), progress.getLastReviewedAt() != null))
                .toList();

        int reviewCount = (int) due.stream()
                .filter(progress -> progress.getLastReviewedAt() != null)
                .count();
        int newCount = dueItems.size() - reviewCount;

        int remaining = effectiveBatchSize - dueItems.size();
        List<KanjiLearnSessionResponse.LearnItem> newItems = new ArrayList<>();
        if (remaining > 0) {
            List<Long> newIds = userKanjiListItemRepository.findUnprogressedKanjiIds(userId, listId, remaining);
            if (!newIds.isEmpty()) {
                Map<Long, Kanji> kanjiById = kanjiRepository.findAllByIdIn(newIds).stream()
                        .collect(Collectors.toMap(Kanji::getKanjiId, k -> k));
                newItems = newIds.stream()
                        .map(kanjiById::get)
                        .filter(Objects::nonNull)
                        .map(kanji -> toLearnItem(kanji, false))
                        .toList();
                newCount += newItems.size();
            }
        }

        List<KanjiLearnSessionResponse.LearnItem> allItems = new ArrayList<>();
        allItems.addAll(dueItems);
        allItems.addAll(newItems);

        int deficit = effectiveBatchSize - allItems.size();
        if (deficit > 0) {
            List<Long> excludedKanjiIds = allItems.stream()
                    .map(KanjiLearnSessionResponse.LearnItem::id)
                    .toList();
            
            List<UserKanjiProgress> fallback;
            if (excludedKanjiIds.isEmpty()) {
                fallback = progressRepository.findFallbackReviewsByList(
                        userId, listId, PageRequest.of(0, deficit));
            } else {
                fallback = progressRepository.findFallbackReviewsByListExcluding(
                        userId, listId, excludedKanjiIds, PageRequest.of(0, deficit));
            }

            List<KanjiLearnSessionResponse.LearnItem> fallbackItems = fallback.stream()
                    .map(progress -> toLearnItem(progress.getKanji(), progress.getLastReviewedAt() != null))
                    .toList();

            reviewCount += fallbackItems.size();
            allItems.addAll(fallbackItems);
        }

        List<Map<String, Object>> quizInput = allItems.stream()
                .map(item -> Map.of(
                        "kanjiId", (Object) item.id(),
                        "character", (Object) item.character()
                ))
                .toList();

        List<KanjiReviewSessionResponse.QuizQuestion> questions = List.of();
        if (!quizInput.isEmpty()) {
            questions = aiServiceClient.generateQuestions(quizInput);
        }

        String sessionType = reviewCount == 0 ? "NEW" : (newCount == 0 ? "REVIEW" : "MIXED");
        return new KanjiLearnSessionResponse(sessionType, reviewCount, newCount, allItems, questions);
    }

    @Override
    @Transactional
    public KanjiReviewResultResponse submitReview(Long userId, Long listId, KanjiReviewRequest request) {
        if (userId == null) throw new ApiException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        if (listId == null || listId <= 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "List ID is required");
        }
        if (request.getReviews() == null || request.getReviews().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Reviews list must not be empty");
        }
        validateOwnedList(userId, listId);

        Instant now = Instant.now();
        List<KanjiReviewResultResponse.ReviewResult> results = new ArrayList<>();

        for (KanjiReviewRequest.ReviewItem item : request.getReviews()) {
            if (!userKanjiListItemRepository.existsByListListIdAndKanjiKanjiId(listId, item.getKanjiId())) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Kanji is not in the selected list: " + item.getKanjiId());
            }

            UserKanjiProgress progress = progressRepository
                    .findByUserIdAndKanjiKanjiId(userId, item.getKanjiId())
                    .orElseGet(() -> {
                        Kanji kanji = kanjiRepository.findById(item.getKanjiId())
                                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND,
                                        "Kanji not found: " + item.getKanjiId()));
                        return UserKanjiProgress.builder()
                                .userId(userId)
                                .kanji(kanji)
                                .status(KanjiLearningStatus.LEARNING)
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
            results.add(new KanjiReviewResultResponse.ReviewResult(
                    item.getKanjiId(),
                    progress.getStatus().name(),
                    progress.getNextReviewAt(),
                    intervalDays
            ));
        }

        userKanjiListRepository.touchList(listId);
        userService.updateStreak(userId);

        return new KanjiReviewResultResponse("success", results);
    }

    @Override
    @Transactional
    public void addKanjiToList(Long userId, Long kanjiListId, Long kanjiId) {
        if (userId == null) throw new ApiException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        if (kanjiListId == null || kanjiId == null || kanjiListId <= 0 || kanjiId <= 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid list ID or kanji ID");
        }

        boolean isOwner = userKanjiListRepository.existsByListIdAndUserId(kanjiListId, userId);
        if (!isOwner) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You do not have permission to modify this list");
        }

        if (!kanjiRepository.existsById(kanjiId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Kanji not found");
        }

        boolean alreadyExists = userKanjiListRepository.existsKanjiInList(kanjiListId, kanjiId);
        if (alreadyExists) {
            throw new ApiException(HttpStatus.CONFLICT, "Kanji này đã có trong danh sách");
        }

        int inserted = userKanjiListRepository.addKanjiToList(kanjiListId, kanjiId);
        if (inserted > 0) {
            userKanjiListRepository.touchList(kanjiListId);
        }
    }

    private KanjiLearningListResponse toLearningListResponse(UserKanjiList list) {
        return KanjiLearningListResponse.builder()
                .listId(list.getListId())
                .listName(list.getListName())
                .sourceType(sourceTypeName(list))
                .kanjiCount(userKanjiListItemRepository.countByListListId(list.getListId()))
                .build();
    }

    private void seedInitialProgress(Long userId, Long listId, Instant now) {
        List<Long> kanjiIds = userKanjiListItemRepository.findUnprogressedKanjiIds(
                userId, listId, INITIAL_LIST_SEED_SIZE);
        if (kanjiIds.isEmpty()) {
            return;
        }

        Map<Long, Kanji> kanjiById = kanjiRepository.findAllByIdIn(kanjiIds).stream()
                .collect(Collectors.toMap(Kanji::getKanjiId, k -> k));

        List<UserKanjiProgress> progressItems = kanjiIds.stream()
                .map(kanjiById::get)
                .filter(Objects::nonNull)
                .map(kanji -> UserKanjiProgress.builder()
                        .userId(userId)
                        .kanji(kanji)
                        .status(KanjiLearningStatus.LEARNING)
                        .currentStep(0)
                        .repetitions(0)
                        .nextReviewAt(now)
                        .build())
                .toList();

        progressRepository.saveAll(progressItems);
    }

    private void validateOwnedList(Long userId, Long listId) {
        if (listId == null || listId <= 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid list ID");
        }
        if (!userKanjiListRepository.existsByListIdAndUserId(listId, userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You do not have permission to access this list");
        }
    }

    private void validateListBatchSize(int batchSize) {
        if (batchSize < 1 || batchSize > MAX_LEARN_BATCH_SIZE) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Batch size must be between 1 and " + MAX_LEARN_BATCH_SIZE);
        }
    }

    private long numberToLong(Number value) {
        return value == null ? 0L : value.longValue();
    }

    private String sourceTypeName(UserKanjiList list) {
        return list.getSourceType() == null
                ? KanjiListSourceType.CUSTOM.name()
                : list.getSourceType().name();
    }

    private void applyEbbinghaus(UserKanjiProgress progress, int quality, Instant now) {
        int step = progress.getCurrentStep() != null ? progress.getCurrentStep() : 0;
        int reps = progress.getRepetitions() != null ? progress.getRepetitions() : 0;

        SpacedRepetitionCalculator.SRSResult srsResult = SpacedRepetitionCalculator.calculateNext(step, reps, quality, now);

        progress.setCurrentStep(srsResult.newStep());
        progress.setRepetitions(srsResult.newRepetitions());
        progress.setLastQuality(quality);
        progress.setLastReviewedAt(now);
        progress.setNextReviewAt(srsResult.nextReviewAt());
        progress.setStatus(KanjiLearningStatus.valueOf(srsResult.status()));
    }

    private KanjiLearnSessionResponse.LearnItem toLearnItem(Kanji kanji, boolean isReview) {
        return new KanjiLearnSessionResponse.LearnItem(
                kanji.getKanjiId(),
                kanji.getCharacter(),
                arrayToList(kanji.getReadingsOn()),
                arrayToList(kanji.getReadingsKun()),
                buildMeaning(kanji.getMeanings()),
                formatReading(kanji.getReading()),
                kanji.getStrokes(),
                isReview
        );
    }

    private List<String> arrayToList(String[] arr) {
        return arr == null ? List.of() : Arrays.asList(arr);
    }

    private String buildMeaning(String[] meanings) {
        if (meanings == null || meanings.length == 0) return "";
        return String.join("; ", meanings);
    }

    private String formatReading(String reading) {
        if (reading == null || reading.isBlank()) return "";
        return Arrays.stream(reading.trim().split("[\\s,]+"))
                .map(String::toUpperCase)
                .collect(Collectors.joining(", "));
    }

    private void validateLevel(String level) {
        if (!JLPT_LEVELS.contains(level)) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Invalid JLPT level: " + level + ". Must be one of: " + JLPT_LEVELS);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public KanjiListDetailResponse getListDetails(Long userId, Long listId, long page, int size) {
        if (userId == null) throw new ApiException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        if (listId == null || listId <= 0) throw new ApiException(HttpStatus.BAD_REQUEST, "List ID is invalid");

        UserKanjiList list = userKanjiListRepository.findById(listId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Kanji list not found"));

        if (!list.getUser().getUserId().equals(userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You do not have permission to view this list");
        }

        long totalRecords = userKanjiListItemRepository.countKanjisByListId(listId);
        int totalPages = (int) Math.ceil((double) totalRecords / size);
        if (totalPages < 1) totalPages = 1;

        long offset = (page - 1) * size;
        List<UserKanjiListItemRepository.KanjiListItemRow> rows = userKanjiListItemRepository
                .findKanjisByListIdPaginated(listId, size, offset);

        List<KanjiListDetailResponse.KanjiSummary> kanjis = rows.stream()
                .map(row -> new KanjiListDetailResponse.KanjiSummary(row.getId(), row.getCharacter()))
                .toList();

        return KanjiListDetailResponse.builder()
                .listId(list.getListId())
                .listName(list.getListName())
                .kanjis(kanjis)
                .totalRecords(totalRecords)
                .totalPages(totalPages)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public KanjiReviewSessionResponse getReviewSession(Long userId, Long listId, int batchSize) {
        if (userId == null) throw new ApiException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        validateOwnedList(userId, listId);

        long totalCount = userKanjiListItemRepository.countByListListId(listId);
        int effectiveBatchSize = (int) Math.min((long) batchSize, totalCount);

        Instant now = Instant.now();
        List<UserKanjiProgress> due = progressRepository.findDueReviewsByList(
                userId, listId, now, PageRequest.of(0, effectiveBatchSize));

        if (due.isEmpty()) {
            due = progressRepository.findFallbackReviewsByList(
                    userId, listId, PageRequest.of(0, effectiveBatchSize));
        }

        if (due.isEmpty()) {
            return new KanjiReviewSessionResponse(List.of());
        }

        List<Map<String, Object>> items = due.stream()
                .map(progress -> Map.of(
                        "kanjiId", (Object) progress.getKanji().getKanjiId(),
                        "character", (Object) progress.getKanji().getCharacter()
                ))
                .toList();

        List<KanjiReviewSessionResponse.QuizQuestion> questions = aiServiceClient.generateQuestions(items);
        return new KanjiReviewSessionResponse(questions);
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseBodyEmitter explainReviewAnswer(Long userId, KanjiExplainRequest request) {
        if (userId == null) throw new ApiException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        return aiServiceClient.explainAnswer(request);
    }
}
