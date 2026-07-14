package com.jela.api.dataimport;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jela.api.entity.*;
import com.jela.api.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@Slf4j
@RequiredArgsConstructor
public class DataImportService {

    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final KanjiRepository kanjiRepository;
    private final VocabularyRepository vocabularyRepository;
    private final GrammarRepository grammarRepository;
    private final ObjectMapper objectMapper;
    private final DataImportProperties properties;

    @Transactional
    public void importData() {
        if (!properties.isEnabled()) {
            log.info("Bỏ qua import dữ liệu từ JSON (disabled).");
            return;
        }

        log.info("Bắt đầu quá trình kiểm tra và import dữ liệu...");
        
        Path rootPath = properties.resolveDataDir();
        File dataImportDir = rootPath.toFile();

        if (!dataImportDir.exists() || !dataImportDir.isDirectory()) {
            log.warn("Thư mục data-import không tồn tại tại đường dẫn: {}. Bỏ qua import.", rootPath);
            return;
        }

        importCourses(rootPath.resolve("courses"));
        importLessons(rootPath.resolve("lessons"));
        importKanji(rootPath.resolve("kanji"));
        importVocabulary(rootPath.resolve("vocabulary"));
        importGrammar(rootPath.resolve("grammar"));
            
        log.info("Quá trình import dữ liệu hoàn tất.");
    }

    private void importCourses(Path directoryPath) {
        try (Stream<Path> paths = Files.walk(directoryPath)) {
            paths.filter(path -> path.toString().endsWith(".json")).forEach(path -> {
                try {
                    List<Course> coursesFromFile = objectMapper.readValue(path.toFile(), new TypeReference<List<Course>>() {});
                    List<Course> newCourses = new ArrayList<>();
                    for (Course course : coursesFromFile) {
                        if (!courseRepository.existsById(course.getId())) {
                            newCourses.add(course);
                        }
                    }
                    if (!newCourses.isEmpty()) {
                        courseRepository.saveAll(newCourses);
                        log.info("Đã import {} khóa học mới từ file: {}", newCourses.size(), path.getFileName());
                    }
                } catch (Exception e) {
                    log.error("Lỗi khi import file course: {}", path.getFileName(), e);
                }
            });
        } catch (IOException e) {
            log.warn("Không thể đọc thư mục courses: {}", e.getMessage());
        }
    }

    private void importLessons(Path directoryPath) {
         try (Stream<Path> paths = Files.walk(directoryPath)) {
            paths.filter(path -> path.toString().endsWith(".json")).forEach(path -> {
                try {
                    List<Lesson> lessonsFromFile = objectMapper.readValue(path.toFile(), new TypeReference<List<Lesson>>() {});
                    List<Lesson> newLessons = new ArrayList<>();
                    for (Lesson lesson : lessonsFromFile) {
                        if (!lessonRepository.existsById(lesson.getId())) {
                            // Gán course cho lesson trước khi lưu
                            if (lesson.getCourse() != null && lesson.getCourse().getId() != null) {
                                courseRepository.findById(lesson.getCourse().getId()).ifPresent(lesson::setCourse);
                            }
                            newLessons.add(lesson);
                        }
                    }
                    if (!newLessons.isEmpty()) {
                        lessonRepository.saveAll(newLessons);
                        log.info("Đã import {} bài học mới từ file: {}", newLessons.size(), path.getFileName());
                    }
                } catch (Exception e) {
                    log.error("Lỗi khi import file lesson: {}", path.getFileName(), e);
                }
            });
        } catch (IOException e) {
            log.warn("Không thể đọc thư mục lessons: {}", e.getMessage());
        }
    }

    private void importKanji(Path directoryPath) {
        try (Stream<Path> paths = Files.walk(directoryPath)) {
            paths.filter(path -> path.toString().endsWith(".json")).forEach(path -> {
                try {
                    List<Kanji> kanjisFromFile = objectMapper.readValue(path.toFile(), new TypeReference<List<Kanji>>() {});
                    List<Kanji> newKanjis = kanjisFromFile.stream()
                        .filter(kanji -> !kanjiRepository.existsById(kanji.getKanjiId()))
                        .collect(Collectors.toList());
                    
                    if (!newKanjis.isEmpty()) {
                        kanjiRepository.saveAll(newKanjis);
                        log.info("Đã import {} kanji mới từ file: {}", newKanjis.size(), path.getFileName());
                    }
                } catch (Exception e) {
                    log.error("Lỗi khi import file kanji: {}", path.getFileName(), e);
                }
            });
        } catch (IOException e) {
            log.warn("Không thể đọc thư mục kanji: {}", e.getMessage());
        }
    }

    private void importVocabulary(Path directoryPath) {
        try (Stream<Path> paths = Files.walk(directoryPath)) {
            paths.filter(path -> path.toString().endsWith(".json")).forEach(path -> {
                try {
                    List<Vocabulary> vocabulariesFromFile = objectMapper.readValue(path.toFile(), new TypeReference<List<Vocabulary>>() {});
                    List<Vocabulary> newVocabularies = vocabulariesFromFile.stream()
                        .filter(vocab -> !vocabularyRepository.existsById(vocab.getId()))
                        .collect(Collectors.toList());

                    if (!newVocabularies.isEmpty()) {
                        vocabularyRepository.saveAll(newVocabularies);
                        log.info("Đã import {} từ vựng mới từ file: {}", newVocabularies.size(), path.getFileName());
                    }
                } catch (Exception e) {
                    log.error("Lỗi khi import file vocabulary: {}", path.getFileName(), e);
                }
            });
        } catch (IOException e) {
            log.warn("Không thể đọc thư mục vocabulary: {}", e.getMessage());
        }
    }

    private void importGrammar(Path directoryPath) {
        try (Stream<Path> paths = Files.walk(directoryPath)) {
            paths.filter(path -> path.toString().endsWith(".json")).forEach(path -> {
                try {
                    List<Grammar> grammarsFromFile = objectMapper.readValue(path.toFile(), new TypeReference<List<Grammar>>() {});
                    List<Grammar> newGrammars = grammarsFromFile.stream()
                        .filter(grammar -> !grammarRepository.existsById(grammar.getId()))
                        .collect(Collectors.toList());

                    if (!newGrammars.isEmpty()) {
                        grammarRepository.saveAll(newGrammars);
                        log.info("Đã import {} ngữ pháp mới từ file: {}", newGrammars.size(), path.getFileName());
                    }
                } catch (Exception e) {
                    log.error("Lỗi khi import file grammar: {}", path.getFileName(), e);
                }
            });
        } catch (IOException e) {
            log.warn("Không thể đọc thư mục grammar: {}", e.getMessage());
        }
    }
}
