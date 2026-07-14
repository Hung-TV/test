package com.jela.api.service.impl;

import com.jela.api.dto.request.KanjiReviewRequest;
import java.time.Instant;
import com.jela.api.dto.response.KanjiDetailResponse;
import com.jela.api.dto.response.KanjiSearchResponse;
import com.jela.api.entity.Kanji;
import com.jela.api.entity.User;
import com.jela.api.entity.UserKanjiList;
import com.jela.api.entity.UserKanjiProgress;
import com.jela.api.enums.KanjiListSourceType;
import com.jela.api.enums.KanjiLearningStatus;
import com.jela.api.exception.ApiException;
import com.jela.api.repository.DictionaryRepository;
import com.jela.api.repository.KanjiHistoryRepository;
import com.jela.api.repository.KanjiRepository;
import com.jela.api.repository.UserKanjiListItemRepository;
import com.jela.api.repository.UserKanjiListRepository;
import com.jela.api.repository.UserKanjiProgressRepository;
import com.jela.api.repository.UserRepository;
import com.jela.api.client.AiServiceClient;
import com.jela.api.service.KanjiListService;
import com.jela.api.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class KanjiServiceImplTest {

    @Mock
    private KanjiRepository kanjiRepository;

    @Mock
    private KanjiHistoryRepository kanjiHistoryRepository;

    @Mock
    private UserKanjiProgressRepository progressRepository;

    @Mock
    private DictionaryRepository dictionaryRepository;

    @Mock
    private UserKanjiListRepository userKanjiListRepository;

    @Mock
    private UserKanjiListItemRepository userKanjiListItemRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AiServiceClient aiServiceClient;

    @Mock
    private UserService userService;

    @InjectMocks
    private KanjiServiceImpl kanjiService;

    @InjectMocks
    private KanjiListServiceImpl kanjiListService;

    @Test
    void searchPreservesRankedIdOrderAndBuildsMeaning() {
        Kanji lowerRanked = kanji(10L, "K1", "N5");
        Kanji higherRanked = kanji(11L, "K2", "N5");
        higherRanked.setMeanings(new String[]{"first", "second"});
        when(kanjiRepository.findSearchResultIds("ai")).thenReturn(List.of(11L, 10L));
        when(kanjiRepository.findAllByIdIn(List.of(11L, 10L))).thenReturn(List.of(lowerRanked, higherRanked));

        var response = kanjiService.search(" ai ");

        verify(kanjiRepository).findSearchResultIds("ai");
        assertThat(response)
                .extracting(KanjiSearchResponse::id)
                .containsExactly(11L, 10L);
        assertThat(response.get(0).meaning()).isEqualTo("first; second");
    }

    @Test
    void getKanjiByLevelUsesOneBasedPageAndFixedPageSize() {
        Kanji kanji = kanji(10L, "K1", "N5");
        when(kanjiRepository.findByJlpt(eq("N5"), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(kanji)));

        var response = kanjiService.getKanjiByLevel("N5", 1);

        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        verify(kanjiRepository).findByJlpt(eq("N5"), pageableCaptor.capture());
        assertThat(pageableCaptor.getValue().getPageNumber()).isZero();
        assertThat(pageableCaptor.getValue().getPageSize()).isEqualTo(10);
        assertThat(response.getContent()).singleElement()
                .satisfies(item -> {
                    assertThat(item.id()).isEqualTo(10L);
                    assertThat(item.character()).isEqualTo("K1");
                });
    }

    @Test
    void getKanjiByLevelRejectsPageLessThanOne() {
        assertThatThrownBy(() -> kanjiService.getKanjiByLevel("N5", 0))
                .isInstanceOf(ApiException.class)
                .satisfies(ex -> assertThat(((ApiException) ex).getStatus()).isEqualTo(HttpStatus.BAD_REQUEST));
    }

    @Test
    void getKanjiByLevelRejectsInvalidLevel() {
        assertThatThrownBy(() -> kanjiService.getKanjiByLevel("ABC", 1))
                .isInstanceOf(ApiException.class)
                .satisfies(ex -> assertThat(((ApiException) ex).getStatus()).isEqualTo(HttpStatus.BAD_REQUEST));
    }

    @Test
    void getDetailIncludesOnAndKunExampleWordsAndRecordsHistory() {
        Kanji kanji = kanji(10L, "K1", "N5");
        kanji.setReadingsOn(new String[]{" on.", "on"});
        kanji.setReadingsKun(new String[]{"-ku.n"});
        kanji.setReading("han viet");
        kanji.setMeanings(new String[]{"first", "second"});
        kanji.setRadical("radical");

        when(kanjiRepository.findById(10L)).thenReturn(Optional.of(kanji));
        when(dictionaryRepository.findKanjiExampleWordsByReadings("K1", "on", 5)).thenReturn(List.of(
                exampleWordRow(1L, "K1A", "ona", "meaning on"),
                exampleWordRow(2L, "K1B", "onb", "meaning on 2")
        ));
        when(dictionaryRepository.findKanjiExampleWordsByReadings("K1", "kun", 5)).thenReturn(List.of(
                exampleWordRow(3L, "K1C", "kuna", "meaning kun")
        ));

        KanjiDetailResponse response = kanjiService.getDetail(10L, 99L);

        assertThat(response.id()).isEqualTo(10L);
        assertThat(response.character()).isEqualTo("K1");
        assertThat(response.reading()).isEqualTo("HAN, VIET");
        assertThat(response.meaning()).isEqualTo("first; second");
        assertThat(response.radical()).isEqualTo("radical");
        assertThat(response.on())
                .extracting(KanjiDetailResponse.ExampleWordResponse::id)
                .containsExactly(1L, 2L);
        assertThat(response.on().get(0))
                .satisfies(word -> {
                    assertThat(word.word()).isEqualTo("K1A");
                    assertThat(word.hiragana()).isEqualTo("ona");
                    assertThat(word.meaning()).isEqualTo("meaning on");
                });
        assertThat(response.kun()).singleElement()
                .satisfies(word -> {
                    assertThat(word.id()).isEqualTo(3L);
                    assertThat(word.word()).isEqualTo("K1C");
                    assertThat(word.hiragana()).isEqualTo("kuna");
                    assertThat(word.meaning()).isEqualTo("meaning kun");
                });
        verify(dictionaryRepository).findKanjiExampleWordsByReadings("K1", "on", 5);
        verify(dictionaryRepository).findKanjiExampleWordsByReadings("K1", "kun", 5);
        verify(kanjiHistoryRepository).upsertHistory(99L, 10L);
    }

    @Test
    void getDetailCombinesMultipleReadingsIntoSingleQueryParam() {
        Kanji kanji = kanji(10L, "K1", "N5");
        kanji.setReadingsOn(new String[]{" on.", "a+i", "on"});
        kanji.setReadingsKun(null);
        when(kanjiRepository.findById(10L)).thenReturn(Optional.of(kanji));
        when(dictionaryRepository.findKanjiExampleWordsByReadings("K1", "on\u001Fa+i", 5))
                .thenReturn(List.of(exampleWordRow(1L, "K1A", "ona", "meaning on")));

        KanjiDetailResponse response = kanjiService.getDetail(10L, null);

        assertThat(response.on()).singleElement()
                .satisfies(word -> assertThat(word.id()).isEqualTo(1L));
        verify(dictionaryRepository).findKanjiExampleWordsByReadings("K1", "on\u001Fa+i", 5);
    }

    @Test
    void getDetailSkipsExampleQueriesWhenReadingsNormalizeToEmpty() {
        Kanji kanji = kanji(10L, "K1", "N5");
        kanji.setReadingsOn(null);
        kanji.setReadingsKun(new String[]{null, " ", ".", "-"});
        when(kanjiRepository.findById(10L)).thenReturn(Optional.of(kanji));

        KanjiDetailResponse response = kanjiService.getDetail(10L, null);

        assertThat(response.on()).isEmpty();
        assertThat(response.kun()).isEmpty();
        verify(dictionaryRepository, never()).findKanjiExampleWordsByReadings(any(), any(), anyInt());
        verify(kanjiHistoryRepository, never()).upsertHistory(any(), any());
    }

    @Test
    void submitReviewCreatesProgressWhenKanjiHasNoProgressYet() {
        Long userId = 1L;
        Long listId = 5L;
        Kanji kanji = kanji(10L, "K1", "N5");
        KanjiReviewRequest request = new KanjiReviewRequest();
        KanjiReviewRequest.ReviewItem item = new KanjiReviewRequest.ReviewItem();
        item.setKanjiId(10L);
        item.setQuality(3);
        request.setReviews(List.of(item));

        when(userKanjiListRepository.existsByListIdAndUserId(listId, userId)).thenReturn(true);
        when(userKanjiListItemRepository.existsByListListIdAndKanjiKanjiId(listId, 10L)).thenReturn(true);
        when(progressRepository.findByUserIdAndKanjiKanjiId(userId, 10L)).thenReturn(Optional.empty());
        when(kanjiRepository.findById(10L)).thenReturn(Optional.of(kanji));

        var response = kanjiListService.submitReview(userId, listId, request);

        assertThat(response.status()).isEqualTo("success");
        assertThat(response.results()).singleElement()
                .satisfies(result -> {
                    assertThat(result.kanjiId()).isEqualTo(10L);
                    assertThat(result.newStatus()).isEqualTo("REVIEWING");
                    assertThat(result.intervalDays()).isEqualTo(3);
                    assertThat(result.nextReviewAt()).isNotNull();
                });
        verify(progressRepository).save(any(UserKanjiProgress.class));
    }

    @Test
    void submitReviewWithAgainOnlyMovesBackOneStep() {
        Long userId = 1L;
        Long listId = 5L;
        Kanji kanji = kanji(10L, "K1", "N5");
        UserKanjiProgress progress = UserKanjiProgress.builder()
                .userId(userId)
                .kanji(kanji)
                .status(KanjiLearningStatus.MASTERED)
                .currentStep(5)
                .repetitions(5)
                .build();
        KanjiReviewRequest request = new KanjiReviewRequest();
        KanjiReviewRequest.ReviewItem item = new KanjiReviewRequest.ReviewItem();
        item.setKanjiId(10L);
        item.setQuality(1);
        request.setReviews(List.of(item));

        when(userKanjiListRepository.existsByListIdAndUserId(listId, userId)).thenReturn(true);
        when(userKanjiListItemRepository.existsByListListIdAndKanjiKanjiId(listId, 10L)).thenReturn(true);
        when(progressRepository.findByUserIdAndKanjiKanjiId(userId, 10L)).thenReturn(Optional.of(progress));

        var response = kanjiListService.submitReview(userId, listId, request);

        assertThat(progress.getCurrentStep()).isEqualTo(4);
        assertThat(progress.getRepetitions()).isEqualTo(5);
        assertThat(progress.getStatus()).isEqualTo(KanjiLearningStatus.REVIEWING);
        assertThat(response.results()).singleElement()
                .satisfies(result -> {
                    assertThat(result.kanjiId()).isEqualTo(10L);
                    assertThat(result.newStatus()).isEqualTo("REVIEWING");
                    assertThat(result.intervalDays()).isEqualTo(21);
                });
        verify(progressRepository).save(progress);
    }

    @Test
    void startLevelListReusesExistingJlptListWithoutSeedingAgain() {
        Long userId = 1L;
        UserKanjiList existing = UserKanjiList.builder()
                .listId(5L)
                .user(User.builder().userId(userId).build())
                .listName("JLPT N5")
                .sourceType(KanjiListSourceType.JLPT_LEVEL)
                .build();

        when(userKanjiListRepository.findByUserUserIdAndSourceTypeAndListName(
                userId, KanjiListSourceType.JLPT_LEVEL, "JLPT N5"))
                .thenReturn(Optional.of(existing));
        when(userKanjiListItemRepository.countByListListId(5L)).thenReturn(120L);

        var response = kanjiListService.startLevelList(userId, "N5");

        assertThat(response.listId()).isEqualTo(5L);
        assertThat(response.listName()).isEqualTo("JLPT N5");
        assertThat(response.sourceType()).isEqualTo("JLPT_LEVEL");
        assertThat(response.kanjiCount()).isEqualTo(120L);
        verify(userKanjiListRepository, never()).saveAndFlush(any(UserKanjiList.class));
        verify(userKanjiListRepository, never()).addKanjiByLevelToList(any(), any());
        verify(progressRepository, never()).saveAll(any());
    }

    @Test
    void startLevelListCreatesJlptListAndSeedsInitialDueProgress() {
        Long userId = 1L;
        User user = User.builder().userId(userId).build();
        Kanji first = kanji(10L, "K1", "N5");
        Kanji second = kanji(11L, "K2", "N5");
        UserKanjiList saved = UserKanjiList.builder()
                .listId(5L)
                .user(user)
                .listName("JLPT N5")
                .sourceType(KanjiListSourceType.JLPT_LEVEL)
                .build();

        when(userKanjiListRepository.findByUserUserIdAndSourceTypeAndListName(
                userId, KanjiListSourceType.JLPT_LEVEL, "JLPT N5"))
                .thenReturn(Optional.empty());
        when(userRepository.getReferenceById(userId)).thenReturn(user);
        when(userKanjiListRepository.saveAndFlush(any(UserKanjiList.class))).thenReturn(saved);
        when(userKanjiListItemRepository.countByListListId(5L)).thenReturn(120L);

        var response = kanjiListService.startLevelList(userId, "N5");

        assertThat(response.listName()).isEqualTo("JLPT N5");
        assertThat(response.sourceType()).isEqualTo("JLPT_LEVEL");
        assertThat(response.kanjiCount()).isEqualTo(120L);
        verify(userKanjiListRepository).addKanjiByLevelToList(5L, "N5");
        verify(userKanjiListRepository).touchList(5L);
        verify(progressRepository, never()).saveAll(any());
    }

    @Test
    void getLearnSessionByListPadsWithFallback() {
        Long userId = 1L;
        Long listId = 5L;
        Kanji kanji2 = kanji(11L, "K2", "N5");
        UserKanjiProgress p2 = UserKanjiProgress.builder()
                .progressId(2L)
                .userId(userId)
                .kanji(kanji2)
                .status(KanjiLearningStatus.LEARNING)
                .currentStep(1)
                .repetitions(2)
                .lastReviewedAt(Instant.now().minusSeconds(100))
                .build();

        when(userKanjiListRepository.existsByListIdAndUserId(listId, userId)).thenReturn(true);
        when(userKanjiListItemRepository.countByListListId(listId)).thenReturn(2L);
        // Due is empty
        when(progressRepository.findDueReviewsByList(eq(userId), eq(listId), any(Instant.class), any(Pageable.class)))
                .thenReturn(List.of());
        // New is empty
        when(userKanjiListItemRepository.findUnprogressedKanjiIds(eq(userId), eq(listId), anyInt()))
                .thenReturn(List.of());
        // Fallback returns p2
        when(progressRepository.findFallbackReviewsByList(eq(userId), eq(listId), any(Pageable.class)))
                .thenReturn(List.of(p2));
        
        // AI service mock
        when(aiServiceClient.generateQuestions(any(List.class))).thenReturn(List.of());

        var response = kanjiListService.getLearnSessionByList(userId, listId, 4);

        assertThat(response.sessionType()).isEqualTo("REVIEW");
        assertThat(response.reviewCount()).isEqualTo(1);
        assertThat(response.newCount()).isZero();
        assertThat(response.items()).hasSize(1);
        assertThat(response.items().get(0).id()).isEqualTo(11L);
    }

    @Test
    void submitReviewUpdatesFallbackResultWithoutChangingSRProgress() {
        Long userId = 1L;
        Long listId = 5L;
        Kanji kanji = kanji(10L, "K1", "N5");
        Instant originalNextReview = Instant.now().plusSeconds(3600); // 1 hour in the future (fallback review)
        UserKanjiProgress progress = UserKanjiProgress.builder()
                .progressId(1L)
                .userId(userId)
                .kanji(kanji)
                .status(KanjiLearningStatus.REVIEWING)
                .currentStep(2)
                .repetitions(5)
                .nextReviewAt(originalNextReview)
                .build();

        KanjiReviewRequest request = new KanjiReviewRequest();
        KanjiReviewRequest.ReviewItem item = new KanjiReviewRequest.ReviewItem();
        item.setKanjiId(10L);
        item.setQuality(3);
        request.setReviews(List.of(item));

        when(userKanjiListRepository.existsByListIdAndUserId(listId, userId)).thenReturn(true);
        when(userKanjiListItemRepository.existsByListListIdAndKanjiKanjiId(listId, 10L)).thenReturn(true);
        when(progressRepository.findByUserIdAndKanjiKanjiId(userId, 10L)).thenReturn(Optional.of(progress));

        var result = kanjiListService.submitReview(userId, listId, request);

        assertThat(result.status()).isEqualTo("success");
        // Verify progress details are kept exactly the same
        assertThat(progress.getStatus()).isEqualTo(KanjiLearningStatus.REVIEWING);
        assertThat(progress.getCurrentStep()).isEqualTo(2);
        assertThat(progress.getRepetitions()).isEqualTo(5);
        assertThat(progress.getNextReviewAt()).isEqualTo(originalNextReview);
        assertThat(progress.getLastReviewedAt()).isNotNull();
        assertThat(progress.getLastQuality()).isEqualTo(3);
        verify(progressRepository).save(progress);
    }

    @Test
    void submitReviewRejectsKanjiOutsideSelectedList() {
        Long userId = 1L;
        Long listId = 5L;
        KanjiReviewRequest request = new KanjiReviewRequest();
        KanjiReviewRequest.ReviewItem item = new KanjiReviewRequest.ReviewItem();
        item.setKanjiId(10L);
        item.setQuality(3);
        request.setReviews(List.of(item));

        when(userKanjiListRepository.existsByListIdAndUserId(listId, userId)).thenReturn(true);
        when(userKanjiListItemRepository.existsByListListIdAndKanjiKanjiId(listId, 10L)).thenReturn(false);

        assertThatThrownBy(() -> kanjiListService.submitReview(userId, listId, request))
                .isInstanceOf(ApiException.class)
                .satisfies(ex -> assertThat(((ApiException) ex).getStatus()).isEqualTo(HttpStatus.BAD_REQUEST));
        verify(progressRepository, never()).save(any(UserKanjiProgress.class));
    }

    private Kanji kanji(Long id, String character, String level) {
        return Kanji.builder()
                .kanjiId(id)
                .character(character)
                .jlpt(level)
                .meanings(new String[]{"meaning"})
                .readingsOn(new String[]{"on"})
                .readingsKun(new String[]{"kun"})
                .strokes(1)
                .build();
    }

    private DictionaryRepository.KanjiExampleWordRow exampleWordRow(
            Long id,
            String word,
            String hiragana,
            String meaning) {
        return new DictionaryRepository.KanjiExampleWordRow() {
            @Override
            public Long getId() {
                return id;
            }

            @Override
            public String getWord() {
                return word;
            }

            @Override
            public String getHiragana() {
                return hiragana;
            }

            @Override
            public String getMeaning() {
                return meaning;
            }
        };
    }
}
