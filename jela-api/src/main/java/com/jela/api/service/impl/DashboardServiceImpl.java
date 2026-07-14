package com.jela.api.service.impl;

import com.jela.api.dto.response.DashboardResponse;
import com.jela.api.entity.Dictionary;
import com.jela.api.entity.Kanji;
import com.jela.api.entity.User;
import com.jela.api.enums.KanjiLearningStatus;
import com.jela.api.enums.Level;
import com.jela.api.exception.ApiException;
import com.jela.api.repository.*;
import com.jela.api.repository.DictionaryRepository.DictionarySearchRow;
import com.jela.api.repository.UserDictionaryListRepository.DictionaryListSummaryRow;
import com.jela.api.repository.UserKanjiListRepository.KanjiListLearnSummaryRow;
import com.jela.api.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final UserRepository userRepository;
    private final KanjiRepository kanjiRepository;
    private final UserKanjiProgressRepository userKanjiProgressRepository;
    private final UserKanjiListRepository userKanjiListRepository;
    private final DictionaryRepository dictionaryRepository;
    private final UserDictionaryProgressRepository userDictionaryProgressRepository;
    private final UserDictionaryListRepository userDictionaryListRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardResponse getDashboardStats(Long userId) {
        if (userId == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Chưa đăng nhập");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy user với ID: " + userId));

        ZoneId zoneId = ZoneId.of("Asia/Ho_Chi_Minh");
        Instant now = Instant.now();
        Instant endOfToday = LocalDate.ofInstant(now, zoneId).atTime(java.time.LocalTime.MAX).atZone(zoneId).toInstant();

        // 1. Streak Count & Status
        int activeStreak = 0;
        if (user.getStreakCount() != null && user.getLastStudiedAt() != null) {
            LocalDate lastStudiedDate = LocalDate.ofInstant(user.getLastStudiedAt(), zoneId);
            LocalDate today = LocalDate.ofInstant(now, zoneId);
            long daysBetween = ChronoUnit.DAYS.between(lastStudiedDate, today);
            if (daysBetween <= 1) {
                activeStreak = user.getStreakCount();
            }
        }
        String streakStatus = activeStreak > 0 
                ? "Tuyệt vời! Hãy giữ vững phong độ học tập nhé." 
                : "Học ngay hôm nay để bắt đầu chuỗi ngày học tập mới!";

        // 2. Kanji Level Progress
        String jlptLevel = (user.getLevel() == null || user.getLevel() == Level.BEGINNER) ? "N5" : user.getLevel().name();
        long totalKanji = kanjiRepository.countByJlpt(jlptLevel);
        long learnedKanji = userKanjiProgressRepository.countByUserIdAndKanjiJlptAndStatusIn(
                userId, jlptLevel, List.of(KanjiLearningStatus.LEARNING, KanjiLearningStatus.REVIEWING, KanjiLearningStatus.MASTERED));
        int kanjiPercentage = totalKanji > 0 ? (int) ((learnedKanji * 100) / totalKanji) : 0;

        DashboardResponse.KanjiProgressDto kanjiProgress = DashboardResponse.KanjiProgressDto.builder()
                .level("KANJI TRÌNH ĐỘ " + jlptLevel)
                .learnedCount(learnedKanji)
                .totalCount(totalKanji)
                .percentage(kanjiPercentage)
                .build();

        // 3. Vocabulary Progress
        long totalVocab = userDictionaryProgressRepository.countByUserId(userId);
        long learnedVocab = userDictionaryProgressRepository.countByUserIdAndStatusIn(
                userId, List.of("LEARNING", "REVIEWING", "MASTERED"));
        int vocabPercentage = totalVocab > 0 ? (int) ((learnedVocab * 100) / totalVocab) : 0;

        DashboardResponse.VocabProgressDto vocabProgress = DashboardResponse.VocabProgressDto.builder()
                .level("TIẾN ĐỘ TỪ VỰNG")
                .learnedCount(learnedVocab)
                .totalCount(totalVocab)
                .percentage(vocabPercentage)
                .build();

        // 4. Kanji & Word of the Day (seeded by date + userId)
        LocalDate today = LocalDate.ofInstant(now, zoneId);
        long dateSeed = today.toEpochDay() + userId;

        DashboardResponse.KanjiOfDayDto kanjiOfDay = null;
        long totalKanjiInDb = kanjiRepository.count();
        if (totalKanjiInDb > 0) {
            int kanjiOffset = (int) (Math.abs(dateSeed) % totalKanjiInDb);
            Page<Kanji> kanjiPage = kanjiRepository.findAll(PageRequest.of(kanjiOffset, 1));
            if (kanjiPage.hasContent()) {
                Kanji k = kanjiPage.getContent().get(0);
                kanjiOfDay = DashboardResponse.KanjiOfDayDto.builder()
                        .id(k.getKanjiId())
                        .character(k.getCharacter())
                        .readingsOn(k.getReadingsOn() != null ? List.of(k.getReadingsOn()) : List.of())
                        .readingsKun(k.getReadingsKun() != null ? List.of(k.getReadingsKun()) : List.of())
                        .meanings(k.getMeanings() != null ? List.of(k.getMeanings()) : List.of())
                        .build();
            }
        }

        DashboardResponse.WordOfDayDto wordOfDay = null;
        long totalWordsInDb = dictionaryRepository.count();
        if (totalWordsInDb > 0) {
            int wordOffset = (int) (Math.abs(dateSeed) % totalWordsInDb);
            Page<Dictionary> wordPage = dictionaryRepository.findAll(PageRequest.of(wordOffset, 1));
            if (wordPage.hasContent()) {
                Dictionary d = wordPage.getContent().get(0);
                List<DictionarySearchRow> searchRows = dictionaryRepository.findSearchRowsByIds(List.of(d.getDictionaryId()));
                String gloss = searchRows.isEmpty() ? "" : searchRows.get(0).getGloss();
                wordOfDay = DashboardResponse.WordOfDayDto.builder()
                        .id(d.getDictionaryId())
                        .japanese(d.getKanji() != null && !d.getKanji().isBlank() ? d.getKanji() : d.getHiragana())
                        .reading(d.getHiragana())
                        .meaning(gloss)
                        .build();
            }
        }

        // 5. 3 Overdue/Due Lists (Deadlines) sorted by delay descending (earliest due date first)
        List<DashboardResponse.DeadlineItemDto> deadlines = new ArrayList<>();

        // Kanji Lists
        List<KanjiListLearnSummaryRow> kanjiLists = userKanjiListRepository.findLearnSummariesByUserId(userId, endOfToday);
        for (KanjiListLearnSummaryRow kl : kanjiLists) {
            long dueCount = kl.getDueCount() == null ? 0 : kl.getDueCount().longValue();
            if (dueCount > 0) {
                Instant earliest = userKanjiProgressRepository.findEarliestDueDateByListId(userId, kl.getListId(), endOfToday);
                deadlines.add(DashboardResponse.DeadlineItemDto.builder()
                        .listId(kl.getListId())
                        .listName(kl.getListName())
                        .type("KANJI")
                        .dueCount(dueCount)
                        .earliestDueDate(earliest != null ? earliest : now)
                        .build());
            }
        }

        // Vocabulary Lists
        List<DictionaryListSummaryRow> dictLists = userDictionaryListRepository.findAllSummariesByUserId(userId, endOfToday);
        for (DictionaryListSummaryRow dl : dictLists) {
            long dueCount = dl.getDueCount() == null ? 0 : dl.getDueCount().longValue();
            if (dueCount > 0) {
                Instant earliest = userDictionaryProgressRepository.findEarliestDueDateByListId(userId, dl.getId(), endOfToday);
                deadlines.add(DashboardResponse.DeadlineItemDto.builder()
                        .listId(dl.getId())
                        .listName(dl.getName())
                        .type("VOCAB")
                        .dueCount(dueCount)
                        .earliestDueDate(earliest != null ? earliest : now)
                        .build());
            }
        }

        // Sort by earliestDueDate ascending (which means oldest due date = longest delay comes first)
        deadlines.sort(Comparator.comparing(DashboardResponse.DeadlineItemDto::getEarliestDueDate));
        if (deadlines.size() > 3) {
            deadlines = deadlines.subList(0, 3);
        }

        // 6. Continue Learning Suggestions (2 lists)
        // Prioritize lists with newCount > 0, then sort by updatedAt DESC.
        List<SuggestedList> suggestionsList = new ArrayList<>();
        for (KanjiListLearnSummaryRow kl : kanjiLists) {
            suggestionsList.add(new SuggestedList(
                    kl.getListId(),
                    kl.getListName(),
                    "KANJI",
                    kl.getNewCount() != null ? kl.getNewCount().longValue() : 0,
                    kl.getMasteredCount() != null ? kl.getMasteredCount().longValue() : 0,
                    kl.getTotalCount() != null ? kl.getTotalCount().longValue() : 0,
                    kl.getUpdatedAt() != null ? kl.getUpdatedAt() : now
            ));
        }
        for (DictionaryListSummaryRow dl : dictLists) {
            suggestionsList.add(new SuggestedList(
                    dl.getId(),
                    dl.getName(),
                    "VOCAB",
                    dl.getNewCount() != null ? dl.getNewCount().longValue() : 0,
                    dl.getMasteredCount() != null ? dl.getMasteredCount().longValue() : 0,
                    dl.getWordCount() != null ? dl.getWordCount().longValue() : 0,
                    dl.getUpdatedAt() != null ? dl.getUpdatedAt() : now
            ));
        }

        // Sort priority logic:
        // 1. Lists with newCount > 0 come first
        // 2. Then within those, sort by updatedAt DESC
        suggestionsList.sort((a, b) -> {
            boolean aHasNew = a.newCount > 0;
            boolean bHasNew = b.newCount > 0;
            if (aHasNew != bHasNew) {
                return aHasNew ? -1 : 1; // Prioritize the one with new words
            }
            return b.updatedAt.compareTo(a.updatedAt); // Newest first
        });

        List<DashboardResponse.LearningModuleDto> learningModules = new ArrayList<>();
        for (int i = 0; i < Math.min(2, suggestionsList.size()); i++) {
            SuggestedList sl = suggestionsList.get(i);
            learningModules.add(DashboardResponse.LearningModuleDto.builder()
                    .character(sl.type.equals("KANJI") ? "漢" : "語")
                    .reading(sl.type.equals("KANJI") ? "HÁN TỰ" : "TỪ VỰNG")
                    .title(sl.title)
                    .description("Đang học " + (sl.totalCount - sl.newCount) + "/" + sl.totalCount + (sl.type.equals("KANJI") ? " chữ." : " từ."))
                    .duration("Học tiếp")
                    .category(sl.type)
                    .link(sl.type.equals("KANJI") ? "/kanji" : "/my-decks")
                    .totalCount(sl.totalCount)
                    .newCount(sl.newCount)
                    .masteredCount(sl.masteredCount)
                    .build());
        }

        // If not enough lists, provide default N5 suggestions
        if (learningModules.size() < 2) {
            boolean hasKanjiDefault = learningModules.stream().anyMatch(m -> m.getCategory().equals("KANJI"));
            boolean hasVocabDefault = learningModules.stream().anyMatch(m -> m.getCategory().equals("VOCAB"));

            if (!hasKanjiDefault && learningModules.size() < 2) {
                learningModules.add(DashboardResponse.LearningModuleDto.builder()
                        .character("漢")
                        .reading("HÁN TỰ")
                        .title("Hán tự N5 cơ bản")
                        .description("Bắt đầu học 100+ chữ Hán tự cấp độ N5.")
                        .duration("Bắt đầu")
                        .category("KANJI")
                        .link("/kanji")
                        .totalCount(80)
                        .newCount(80)
                        .masteredCount(0)
                        .build());
            }
            if (!hasVocabDefault && learningModules.size() < 2) {
                learningModules.add(DashboardResponse.LearningModuleDto.builder()
                        .character("語")
                        .reading("TỪ VỰNG")
                        .title("Từ vựng N5 thông dụng")
                        .description("Tích lũy từ vựng cơ bản phục vụ thi JLPT N5.")
                        .duration("Bắt đầu")
                        .category("VOCAB")
                        .link("/my-decks")
                        .totalCount(100)
                        .newCount(100)
                        .masteredCount(0)
                        .build());
            }
        }

        return DashboardResponse.builder()
                .streakCount(activeStreak)
                .streakStatus(streakStatus)
                .kanjiProgress(kanjiProgress)
                .vocabProgress(vocabProgress)
                .kanjiOfDay(kanjiOfDay)
                .wordOfDay(wordOfDay)
                .deadlines(deadlines)
                .learningModules(learningModules)
                .build();
    }

    private static class SuggestedList {
        final Long id;
        final String title;
        final String type;
        final long newCount;
        final long masteredCount;
        final long totalCount;
        final Instant updatedAt;

        SuggestedList(Long id, String title, String type, long newCount, long masteredCount, long totalCount, Instant updatedAt) {
            this.id = id;
            this.title = title;
            this.type = type;
            this.newCount = newCount;
            this.masteredCount = masteredCount;
            this.totalCount = totalCount;
            this.updatedAt = updatedAt;
        }
    }
}
