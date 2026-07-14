import re
import json
import random
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Generator, List, Optional
from similarity import KanjiSimilarityModel
from vocab_similarity import VocabSimilarityModel


app = FastAPI(title="JELA Local AI Service", version="1.0")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize similarity models
try:
    similarity_model = KanjiSimilarityModel()
except Exception as e:
    print(f"Warning: Failed to load Kanji similarity model. Make sure kanji_bank_jlpt.json exists. Error: {e}")
    similarity_model = None

try:
    vocab_similarity_model = VocabSimilarityModel()
except Exception as e:
    print(f"Warning: Failed to load Vocabulary similarity model. Error: {e}")
    vocab_similarity_model = None


# Ollama Endpoint Configuration
OLLAMA_HOST = "http://localhost:11434"
OLLAMA_MODEL = "qwen2.5:3b"  # Default lightweight model, works well on CPU


def clean_llm_output(text: str) -> str:
    """
    Làm sạch output từ LLM (Ollama):
    - Loại bỏ code block markdown (``` ... ```) thường xuất hiện nhầm trong response.
    - Chuẩn hóa xuống dòng và khoảng trắng thừa đầu/cuối.
    """
    # Remove fenced code blocks (e.g. ```markdown ... ``` or plain ```)
    text = re.sub(r"```[a-zA-Z]*\n?", "", text)
    text = text.replace("```", "")
    # Normalize multiple blank lines to at most one
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def stream_ollama(prompt: str, fallback_text: str, temperature: float = 0.4) -> Generator[str, None, None]:
    """
    Generator stream từng token từ Ollama về client dưới dạng plain text.
    Nếu Ollama không sẵn sàng, yield fallback_text một lần.
    Clean ký tự ``` ngay khi nhận từng chunk.
    """
    # Buffer để detect và strip code-fence markers xuất hiện ở ranh giới chunk
    fence_buf = ""
    fence_pattern = re.compile(r"```[a-zA-Z]*\n?|```")
    try:
        with requests.post(
            f"{OLLAMA_HOST}/api/generate",
            json={
                "model": OLLAMA_MODEL,
                "system": "Bạn là giáo viên tiếng Nhật người Việt Nam. Bạn giải thích lỗi sai của học sinh bằng tiếng Việt chuẩn, tự nhiên, dễ hiểu và cực kỳ ngắn gọn. Tuyệt đối KHÔNG viết tiếng Nga, tiếng Anh hay bất kỳ ngôn ngữ nào khác ngoài tiếng Việt và tiếng Nhật.",
                "prompt": prompt,
                "stream": True,
                "options": {
                    "temperature": temperature,
                    "top_p": 0.9,
                    "num_predict": 800
                }
            },
            stream=True,
            timeout=60
        ) as resp:
            if resp.status_code != 200:
                yield fallback_text
                return
            for raw_line in resp.iter_lines():
                if not raw_line:
                    continue
                try:
                    chunk_data = json.loads(raw_line)
                except json.JSONDecodeError:
                    continue
                token = chunk_data.get("response", "")
                if not token:
                    continue
                # Clean code-fence markers in the streamed token
                fence_buf += token
                cleaned = fence_pattern.sub("", fence_buf)
                # Only emit when buffer grows enough to safely detect fences
                # Keep last 6 chars in buffer (longest fence marker: ```xxx\n)
                safe_len = max(0, len(cleaned) - 6)
                if safe_len > 0:
                    yield cleaned[:safe_len]
                    fence_buf = cleaned[safe_len:]
                if chunk_data.get("done", False):
                    # Flush remaining buffer
                    if fence_buf:
                        yield fence_buf
                    break
    except Exception as e:
        print(f"[Ollama Stream Error] {e}")
        yield fallback_text


class KanjiItemInput(BaseModel):
    kanjiId: int
    character: str

class GenerateQuizRequest(BaseModel):
    items: List[KanjiItemInput]

class QuestionOption(BaseModel):
    text: str
    isCorrect: bool

class QuizQuestion(BaseModel):
    kanjiId: int
    character: str
    questionType: str  # KANJI_TO_MEANING, KANJI_TO_SINO_VIETNAMESE, KANJI_TO_KANA
    questionText: str
    options: List[str]
    correctIndex: int

class ExplainRequest(BaseModel):
    correctCharacter: str
    selectedCharacter: str
    questionType: Optional[str] = None   # e.g. MEANING_TO_KANJI, KANJI_TO_SINO_VIETNAMESE, KANJI_TO_KANA
    questionText: Optional[str] = None   # The exact question text shown to the user

def format_sino_vietnamese(reading: str) -> str:
    if not reading:
        return ""
    # Replace commas with spaces to handle already formatted readings safely
    clean_reading = reading.replace(",", " ")
    return ", ".join(word.upper() for word in clean_reading.strip().split())

@app.get("/api/ai/health")
def health_check():
    ollama_ok = False
    try:
        r = requests.get(f"{OLLAMA_HOST}/api/tags", timeout=2)
        if r.status_code == 200:
            ollama_ok = True
    except Exception:
        pass
    
    return {
        "status": "healthy",
        "similarity_model_loaded": similarity_model is not None,
        "ollama_connected": ollama_ok,
        "ollama_model": OLLAMA_MODEL
    }

@app.post("/api/ai/quiz/generate", response_model=List[QuizQuestion])
def generate_quiz(request: GenerateQuizRequest):
    if not similarity_model:
        raise HTTPException(status_code=500, detail="Kanji similarity model not loaded")

    questions = []
    
    for item in request.items:
        char = item.character
        k_data = similarity_model.kanji_by_char.get(char)
        if not k_data:
            continue

        # Get visual, semantic, and phonetic distractors
        visual_distractors = similarity_model.find_distractors(char, "visual", 5)
        semantic_distractors = similarity_model.find_distractors(char, "semantic", 5)
        phonetic_distractors = similarity_model.find_distractors(char, "phonetic", 5)

        # Ensure we have fallback if distractors are empty
        all_chars = [k["character"] for k in similarity_model.kanjis if k["character"] != char]
        fallback_distractors = random.sample(all_chars, 5) if len(all_chars) >= 5 else []

        def get_clean_distractors(dist_list, fallback, count=3):
            res = []
            for d in dist_list:
                if d != char and d not in res:
                    res.append(d)
            if len(res) < count:
                for f in fallback:
                    if f != char and f not in res:
                        res.append(f)
            return res[:count]

        # ----------------------------------------------------
        # Question 1: MEANING -> KANJI (Chọn chữ Kanji cho nghĩa tiếng Việt)
        # ----------------------------------------------------
        meaning_text = k_data["meanings"][0] if k_data["meanings"] else "nghĩa chưa cập nhật"
        # strip [á] etc. from meaning
        meaning_clean = re.sub(r"^\[.*?\]\s*", "", meaning_text)
        
        q1_dist = get_clean_distractors(visual_distractors, fallback_distractors, 3)
        q1_options = [char] + q1_dist
        random.shuffle(q1_options)
        
        questions.append(QuizQuestion(
            kanjiId=item.kanjiId,
            character=char,
            questionType="MEANING_TO_KANJI",
            questionText=f"Chữ Hán nào có nghĩa là: \"{meaning_clean}\"?",
            options=q1_options,
            correctIndex=q1_options.index(char)
        ))

        # ----------------------------------------------------
        # Question 2: KANJI -> SINO-VIETNAMESE (Chọn âm Hán Việt chính xác)
        # ----------------------------------------------------
        correct_sino = k_data["reading"] or "chưa rõ"
        correct_clean = correct_sino.strip().lower()
        
        q2_dist_chars = get_clean_distractors(phonetic_distractors, fallback_distractors, 10)
        q2_dist_values = []
        for c in q2_dist_chars:
            val = similarity_model.kanji_by_char[c]["reading"]
            if val:
                val_clean = val.strip().lower()
                if val_clean != correct_clean and val_clean not in [v.strip().lower() for v in q2_dist_values]:
                    # Ensure no word overlap (e.g. "tri" vs "tri trí")
                    words_correct = set(correct_clean.split())
                    words_val = set(val_clean.split())
                    if not words_correct.intersection(words_val):
                        q2_dist_values.append(val)
        
        # fill up with random readings if not enough
        while len(q2_dist_values) < 3:
            rand_k = random.choice(similarity_model.kanjis)
            if rand_k["reading"]:
                val = rand_k["reading"]
                val_clean = val.strip().lower()
                if val_clean != correct_clean and val_clean not in [v.strip().lower() for v in q2_dist_values]:
                    words_correct = set(correct_clean.split())
                    words_val = set(val_clean.split())
                    if not words_correct.intersection(words_val):
                        q2_dist_values.append(val)
                
        q2_options = [format_sino_vietnamese(opt) for opt in [correct_sino] + q2_dist_values[:3]]
        random.shuffle(q2_options)
        correct_sino_formatted = format_sino_vietnamese(correct_sino)

        questions.append(QuizQuestion(
            kanjiId=item.kanjiId,
            character=char,
            questionType="KANJI_TO_SINO_VIETNAMESE",
            questionText=f"Chữ Hán \"{char}\" có âm Hán Việt chính xác là gì?",
            options=q2_options,
            correctIndex=q2_options.index(correct_sino_formatted)
        ))

        # ----------------------------------------------------
        # Question 3: KANJI -> KANA READING (Chọn cách đọc Onyomi/Kunyomi chính xác)
        # ----------------------------------------------------
        on_readings = k_data["readings_on"]
        kun_readings = k_data["readings_kun"]
        
        correct_kana = ""
        is_on = True
        if on_readings and kun_readings:
            is_on = random.choice([True, False])
            correct_kana = random.choice(on_readings) if is_on else random.choice(kun_readings)
        elif on_readings:
            correct_kana = random.choice(on_readings)
        elif kun_readings:
            correct_kana = random.choice(kun_readings)
            is_on = False
        else:
            correct_kana = "あ"  # fallback

        reading_label = "Onyomi (âm ôn)" if is_on else "Kunyomi (âm huấn)"
        correct_clean_kana = correct_kana.strip().lower()
        
        q3_dist_chars = get_clean_distractors(visual_distractors + phonetic_distractors, fallback_distractors, 10)
        q3_dist_values = []
        for c in q3_dist_chars:
            c_data = similarity_model.kanji_by_char[c]
            c_readings = c_data["readings_on"] if is_on else c_data["readings_kun"]
            if c_readings:
                val = random.choice(c_readings)
                val_clean = val.strip().lower()
                if val_clean != correct_clean_kana and val_clean not in [v.strip().lower() for v in q3_dist_values]:
                    # Clean punctuation
                    c1 = val_clean.replace(".", "").replace("-", "")
                    c2 = correct_clean_kana.replace(".", "").replace("-", "")
                    if c1 != c2:
                        q3_dist_values.append(val)

        # fill fallback
        while len(q3_dist_values) < 3:
            rand_k = random.choice(similarity_model.kanjis)
            rand_readings = rand_k["readings_on"] if is_on else rand_k["readings_kun"]
            if rand_readings:
                val = random.choice(rand_readings)
                val_clean = val.strip().lower()
                if val_clean != correct_clean_kana and val_clean not in [v.strip().lower() for v in q3_dist_values]:
                    c1 = val_clean.replace(".", "").replace("-", "")
                    c2 = correct_clean_kana.replace(".", "").replace("-", "")
                    if c1 != c2:
                        q3_dist_values.append(val)
        
        q3_options = [correct_kana] + q3_dist_values[:3]
        random.shuffle(q3_options)

        questions.append(QuizQuestion(
            kanjiId=item.kanjiId,
            character=char,
            questionType="KANJI_TO_KANA",
            questionText=f"Cách đọc {reading_label} chính xác của chữ \"{char}\" là gì?",
            options=q3_options,
            correctIndex=q3_options.index(correct_kana)
        ))

    random.shuffle(questions)
    return questions

@app.post("/api/ai/quiz/explain")
def explain_wrong_answer(request: ExplainRequest):
    if not similarity_model:
        raise HTTPException(status_code=500, detail="Kanji similarity model not loaded")

    correct_char = request.correctCharacter
    selected_char = request.selectedCharacter

    # Find a kanji that has this reading or is the character itself
    selected_kanji_char = ""
    if selected_char in similarity_model.kanji_by_char:
        selected_kanji_char = selected_char
    else:
        # User selected a reading string (e.g. 'trí' or 'thỉ'). Let's find a Kanji that has this reading to compare.
        sel_lower = selected_char.replace(",", "").strip().lower()
        for k in similarity_model.kanjis:
            # Check Sino-Vietnamese (exact match first, then split word matches)
            if k["reading"]:
                k_read_clean = k["reading"].strip().lower()
                if sel_lower == k_read_clean or sel_lower in [r.lower() for r in k["reading"].split()]:
                    selected_kanji_char = k["character"]
                    break
            # Check Onyomi
            if sel_lower in [r.lower() for r in k["readings_on"]]:
                selected_kanji_char = k["character"]
                break
            # Check Kunyomi
            if sel_lower in [r.lower() for r in k["readings_kun"]]:
                selected_kanji_char = k["character"]
                break
        
        # If no kanji matches, use a placeholder or fallback
        if not selected_kanji_char:
            selected_kanji_char = selected_char

    correct_data = similarity_model.kanji_by_char.get(correct_char)
    selected_data = similarity_model.kanji_by_char.get(selected_kanji_char)

    if not correct_data:
        raise HTTPException(status_code=404, detail=f"Target kanji '{correct_char}' not found")
    
    selected_sino = format_sino_vietnamese(selected_data["reading"]) if selected_data else "chưa rõ"
    selected_meaning = selected_data["meanings"][0] if selected_data and selected_data["meanings"] else "chưa rõ"

    correct_sino = format_sino_vietnamese(correct_data["reading"])
    correct_meaning = correct_data["meanings"][0] if correct_data["meanings"] else "chưa rõ"

    # Build concise prompt directly
    prompt = f"""Bạn là giáo viên tiếng Nhật thân thiện. Hãy viết một lời giải thích ngắn gọn, tự nhiên bằng tiếng Việt để giúp học sinh hiểu tại sao họ lại làm sai câu hỏi sau:

- Học sinh phải chọn chữ đúng: '{correct_char}' (Hán Việt: '{correct_sino}', nghĩa: '{correct_meaning}')
- Nhưng học sinh đã chọn nhầm: '{selected_kanji_char}' (Hán Việt: '{selected_sino}', nghĩa: '{selected_meaning}')

Yêu cầu giải thích:
- Hãy chỉ ra lý do học sinh dễ nhầm lẫn hoặc sự khác nhau mấu chốt giữa hai chữ này (nghĩa khác nhau hoàn toàn hay mặt chữ gần giống nhau) một cách ngắn gọn, dễ hiểu (1-2 câu).
- Đưa ra một ví dụ từ vựng thực tế chứa chữ đúng '{correct_char}' kèm phiên âm và dịch nghĩa Việt để ghi nhớ.
- Giọng điệu thân thiện, động viên học sinh. Không dùng code block, không chia tiêu đề cứng nhắc. Viết dưới 70 từ."""

    sel_label = f"{selected_kanji_char} ('{selected_char}')" if selected_char != selected_kanji_char else selected_char
    fallback_msg = (
        f"### Giải thích nhanh (Hệ thống tự động):\n"
        f"* **Chữ đúng:** {correct_char} — Bộ thủ: {correct_data.get('radical','?')} | Số nét: {correct_data.get('strokes','?')} nét. Nghĩa: {correct_meaning}.\n"
        f"* **Chữ nhầm lẫn:** {sel_label} — Bộ thủ: {selected_data.get('radical','chưa rõ') if selected_data else 'chưa rõ'}, {selected_data.get('strokes','?') if selected_data else '?'} nét. Nghĩa: {selected_meaning}.\n"
        f"* Gợi ý: Hãy chú ý kỹ sự khác biệt ở bộ thủ bên trái hoặc phía dưới của hai chữ!\n"
        f"*(Không kết nối được Ollama '{OLLAMA_MODEL}', hiển thị giải thích tự động)*"
    )
    return StreamingResponse(
        stream_ollama(prompt, fallback_msg, temperature=0.4),
        media_type="text/plain; charset=utf-8"
    )


# ----------------------------------------------------
# Vocabulary Quiz Generation and Explanation Endpoints
# ----------------------------------------------------

class ExampleItem(BaseModel):
    sentenceJp: str
    sentenceVi: str

class VocabItemInput(BaseModel):
    dictionaryId: int
    word: str
    hiragana: str
    meaning: str
    examples: List[ExampleItem] = []

class GenerateVocabQuizRequest(BaseModel):
    items: List[VocabItemInput]

class VocabQuizQuestion(BaseModel):
    dictionaryId: int
    word: str
    hiragana: str
    questionType: str # VOCAB_TO_MEANING, MEANING_TO_VOCAB, CONTEXT_CLOZE, KANA_TO_KANJI
    questionText: str
    options: List[str]
    correctIndex: int
    character: str

class VocabExplainRequest(BaseModel):
    correctWord: str
    selectedWord: str
    questionType: Optional[str] = None   # e.g. VOCAB_TO_MEANING, MEANING_TO_VOCAB, CONTEXT_CLOZE, KANA_TO_KANJI
    questionText: Optional[str] = None   # The exact question text shown to the user
    correctMeaning: Optional[str] = None # Meaning of the correct word
    selectedMeaning: Optional[str] = None # Meaning of the selected (wrong) word
    correctHiragana: Optional[str] = None # Hiragana reading of the correct word

@app.post("/api/ai/vocab-quiz/generate", response_model=List[VocabQuizQuestion])
def generate_vocab_quiz(request: GenerateVocabQuizRequest):
    if not vocab_similarity_model:
        raise HTTPException(status_code=500, detail="Vocab similarity model not loaded")

    questions = []
    
    # Pool meanings from other items or kanji model as fallback
    batch_meanings = [item.meaning for item in request.items if item.meaning]
    
    def get_meaning_distractors(target_meaning, count=3):
        res = []
        for m in batch_meanings:
            if m != target_meaning and m not in res:
                res.append(m)
                if len(res) >= count:
                    break
        # Pad with kanji model meanings if not enough
        if len(res) < count and similarity_model:
            for k in random.sample(similarity_model.kanjis, min(count * 5, len(similarity_model.kanjis))):
                if k["meanings"]:
                    m = k["meanings"][0]
                    clean_m = re.sub(r"^\[.*?\]\s*", "", m)
                    if clean_m != target_meaning and clean_m not in res:
                        res.append(clean_m)
                        if len(res) >= count:
                            break
        # Ultimate fallback
        while len(res) < count:
            res.append(f"nghĩa ngẫu nhiên {random.randint(1, 100)}")
        return res[:count]

    for item in request.items:
        word = item.word
        hiragana = item.hiragana
        meaning = item.meaning or "chưa cập nhật"
        word_questions = []
        
        # 1. VOCAB_TO_MEANING
        if item.meaning:
            meaning_clean = re.sub(r"^\[.*?\]\s*", "", meaning)
            q1_dist = get_meaning_distractors(meaning_clean, 3)
            q1_options = [meaning_clean] + q1_dist
            random.shuffle(q1_options)
            word_questions.append(VocabQuizQuestion(
                dictionaryId=item.dictionaryId,
                word=word,
                hiragana=hiragana,
                questionType="VOCAB_TO_MEANING",
                questionText=f"Từ vựng \"{word}\" ({hiragana}) có nghĩa là gì?",
                options=q1_options,
                correctIndex=q1_options.index(meaning_clean),
                character=word
            ))

        # 2. MEANING_TO_VOCAB
        if item.meaning:
            meaning_clean = re.sub(r"^\[.*?\]\s*", "", meaning)
            is_kanji = any('\u4e00' <= c <= '\u9faf' for c in word)
            if is_kanji:
                q2_dist = vocab_similarity_model.find_visual_distractors(word, 3)
            else:
                q2_dist = vocab_similarity_model.find_phonetic_distractors(hiragana, 3)
                
            q2_options = [word] + q2_dist
            random.shuffle(q2_options)
            word_questions.append(VocabQuizQuestion(
                dictionaryId=item.dictionaryId,
                word=word,
                hiragana=hiragana,
                questionType="MEANING_TO_VOCAB",
                questionText=f"Từ vựng tiếng Nhật nào có nghĩa là: \"{meaning_clean}\"?",
                options=q2_options,
                correctIndex=q2_options.index(word),
                character=word
            ))

        # 3. CONTEXT_CLOZE (Fill-in-the-blank)
        if item.examples:
            ex = random.choice(item.examples)
            sentence_jp = ex.sentenceJp
            sentence_vi = ex.sentenceVi
            
            cloze_sentence = sentence_jp
            if word and word in sentence_jp:
                cloze_sentence = sentence_jp.replace(word, "___")
            elif hiragana and hiragana in sentence_jp:
                cloze_sentence = sentence_jp.replace(hiragana, "___")
            else:
                if len(word) >= 2:
                    cloze_sentence = re.sub(word[:2] + ".*?", "___", sentence_jp)
                else:
                    cloze_sentence = "___ " + sentence_jp

            is_kanji = any('\u4e00' <= c <= '\u9faf' for c in word)
            if is_kanji:
                q3_dist = vocab_similarity_model.find_visual_distractors(word, 3)
            else:
                q3_dist = vocab_similarity_model.find_phonetic_distractors(hiragana, 3)
                
            q3_options = [word] + q3_dist
            random.shuffle(q3_options)
            word_questions.append(VocabQuizQuestion(
                dictionaryId=item.dictionaryId,
                word=word,
                hiragana=hiragana,
                questionType="CONTEXT_CLOZE",
                questionText=f"Điền từ thích hợp vào chỗ trống:\n\"{cloze_sentence}\"\n(Nghĩa câu: \"{sentence_vi}\")",
                options=q3_options,
                correctIndex=q3_options.index(word),
                character=word
            ))

        # 4. KANA_TO_KANJI (Homophones/Furigana spelling check)
        is_kanji = any('\u4e00' <= c <= '\u9faf' for c in word)
        if is_kanji and word != hiragana:
            q4_dist = vocab_similarity_model.find_visual_distractors(word, 3)
            q4_options = [word] + q4_dist
            random.shuffle(q4_options)
            word_questions.append(VocabQuizQuestion(
                dictionaryId=item.dictionaryId,
                word=word,
                hiragana=hiragana,
                questionType="KANA_TO_KANJI",
                questionText=f"Chữ Kanji chính xác viết từ phát âm \"{hiragana}\" (nghĩa: \"{meaning}\") là gì?",
                options=q4_options,
                correctIndex=q4_options.index(word),
                character=word
            ))

        # Ensure we have at least 3 questions for this word by adding variations
        while len(word_questions) < 3:
            if item.meaning:
                meaning_clean = re.sub(r"^\[.*?\]\s*", "", meaning)
                q1_dist = get_meaning_distractors(meaning_clean, 3)
                q1_options = [meaning_clean] + q1_dist
                random.shuffle(q1_options)
                word_questions.append(VocabQuizQuestion(
                    dictionaryId=item.dictionaryId,
                    word=word,
                    hiragana=hiragana,
                    questionType="VOCAB_TO_MEANING",
                    questionText=f"Từ vựng \"{word}\" ({hiragana}) có nghĩa là gì?",
                    options=q1_options,
                    correctIndex=q1_options.index(meaning_clean),
                    character=word
                ))
                if len(word_questions) >= 3:
                    break

                is_kanji = any('\u4e00' <= c <= '\u9faf' for c in word)
                if is_kanji:
                    q2_dist = vocab_similarity_model.find_visual_distractors(word, 3)
                else:
                    q2_dist = vocab_similarity_model.find_phonetic_distractors(hiragana, 3)
                    
                q2_options = [word] + q2_dist
                random.shuffle(q2_options)
                word_questions.append(VocabQuizQuestion(
                    dictionaryId=item.dictionaryId,
                    word=word,
                    hiragana=hiragana,
                    questionType="MEANING_TO_VOCAB",
                    questionText=f"Từ vựng tiếng Nhật nào có nghĩa là: \"{meaning_clean}\"?",
                    options=q2_options,
                    correctIndex=q2_options.index(word),
                    character=word
                ))

        # Randomly select exactly 3 questions for this word
        random.shuffle(word_questions)
        questions.extend(word_questions[:3])

    random.shuffle(questions)
    return questions

@app.post("/api/ai/vocab-quiz/explain")
def explain_wrong_vocab_answer(request: VocabExplainRequest):
    correct_word = request.correctWord
    selected_word = request.selectedWord
    q_type = request.questionType or ""
    q_text = request.questionText or ""
    correct_meaning = request.correctMeaning or "chưa rõ"
    selected_meaning = request.selectedMeaning or "chưa rõ"
    correct_hiragana = request.correctHiragana or ""

    # Build context-aware sections
    question_context = ""
    mistake_reason = ""
    focus_hint = ""

    if q_type == "VOCAB_TO_MEANING":
        question_context = f"Câu hỏi: Từ '{correct_word}' ({correct_hiragana}) có nghĩa là gì?\nHọc sinh chọn nhầm nghĩa '{selected_word}' thay vì nghĩa đúng '{correct_meaning}'."
        mistake_reason = "Học sinh nhầm lẫn nghĩa của từ."
        focus_hint = "Hãy tập trung phân biệt ý nghĩa và sắc thái (nuance) của các nghĩa."
    elif q_type == "MEANING_TO_VOCAB":
        question_context = f"Câu hỏi: Từ tiếng Nhật nào có nghĩa '{correct_meaning}'?\nHọc sinh chọn nhầm từ '{selected_word}' (nghĩa: {selected_meaning}) thay vì từ đúng '{correct_word}'."
        mistake_reason = "Học sinh nhầm lẫn hình dạng hoặc âm đọc của từ."
        focus_hint = "Hãy tập trung vào sự khác biệt hình dạng Kanji hoặc âm Kana giữa hai từ."
    elif q_type == "CONTEXT_CLOZE":
        context_hint = f" Đề bài: \"{q_text}\"" if q_text else ""
        question_context = f"Câu hỏi điền từ vào chỗ trống.{context_hint}\nHọc sinh chọn nhầm '{selected_word}' thay vì từ đúng '{correct_word}' ({correct_meaning})."
        mistake_reason = "Học sinh không nhận ra từ phù hợp với ngữ cảnh câu."
        focus_hint = "Hãy giải thích tại sao từ đúng phù hợp với ngữ cảnh hơn và từ sai không phù hợp."
    elif q_type == "KANA_TO_KANJI":
        question_context = f"Câu hỏi: Chọn chữ Kanji đúng cho phát âm '{correct_hiragana}' (nghĩa: {correct_meaning}).\nHọc sinh chọn nhầm '{selected_word}' thay vì chữ Kanji đúng '{correct_word}'."
        mistake_reason = "Học sinh nhầm lẫn chữ Kanji cùng hoặc gần âm đọc."
        focus_hint = "Hãy so sánh hình dạng và ý nghĩa của hai chữ Kanji để phân biệt."
    else:
        question_context = f"Học sinh trả lời sai câu hỏi về từ '{correct_word}'."
        mistake_reason = "Học sinh cần phân biệt rõ hơn giữa hai từ này."
        focus_hint = "Hãy so sánh ý nghĩa, âm đọc và cách viết của hai từ."

    # Build concise prompt directly
    prompt = f"""Bạn là giáo viên tiếng Nhật thân thiện. Hãy viết một lời giải thích ngắn gọn, tự nhiên bằng tiếng Việt để giúp học sinh hiểu tại sao họ lại làm sai câu hỏi sau:

- Từ đúng: '{correct_word}' (đọc: '{correct_hiragana}', nghĩa: '{correct_meaning}')
- Lựa chọn học sinh chọn nhầm: '{selected_word}' (nghĩa tương ứng: '{selected_meaning}')

Yêu cầu giải thích:
- Hãy chỉ ra lý do học sinh nhầm lẫn hoặc giải thích sự khác biệt cốt lõi về nghĩa/cách dùng giữa hai từ này để người học dễ dàng phân biệt (1-2 câu).
- Đưa ra một câu ví dụ tiếng Nhật cực kỳ ngắn gọn chứa từ đúng '{correct_word}' kèm phiên âm và dịch nghĩa tiếng Việt.
- Giọng điệu thân thiện, động viên học sinh. Không dùng code block, không chia tiêu đề cứng nhắc. Viết dưới 70 từ."""

    fallback_msg = (
        f"### Giải thích nhanh (Hệ thống tự động):\n"
        f"* **Từ đúng:** {correct_word} ({correct_hiragana}) — Nghĩa: {correct_meaning}\n"
        f"* **Từ chọn nhầm:** {selected_word} — Nghĩa: {selected_meaning}\n"
        f"* Gợi ý: Hãy tra cứu kỹ nghĩa và cách viết chữ Hán của hai từ này trong từ điển JELA!\n"
        f"*(Không kết nối được Ollama '{OLLAMA_MODEL}', hiển thị giải thích tự động)*"
    )
    return StreamingResponse(
        stream_ollama(prompt, fallback_msg, temperature=0.4),
        media_type="text/plain; charset=utf-8"
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
