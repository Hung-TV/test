import os
import csv
import random

# Path to dictionary CSV
DICT_CSV_PATH = os.path.join(os.path.dirname(__file__), "..", "data-import", "dictionary.csv")

class VocabSimilarityModel:
    def __init__(self):
        self.words = []
        self.load_data()

    def load_data(self):
        if not os.path.exists(DICT_CSV_PATH):
            print(f"Warning: dictionary.csv not found at {DICT_CSV_PATH}")
            return

        print("Loading dictionary.csv for vocabulary distractor generation...")
        try:
            with open(DICT_CSV_PATH, "r", encoding="utf-8") as f:
                reader = csv.reader(f, delimiter="|")
                next(reader, None)  # skip header
                for row in reader:
                    if len(row) >= 3:
                        self.words.append({
                            "id": int(row[0]),
                            "kanji": row[1],
                            "hiragana": row[2]
                        })
            print(f"Successfully loaded {len(self.words)} vocabulary entries.")
        except Exception as e:
            print(f"Error loading dictionary.csv: {e}")

    def find_visual_distractors(self, target_word, count=3):
        """
        Finds words that share Kanji characters with the target word.
        """
        kanjis = [c for c in target_word if '\u4e00' <= c <= '\u9faf']
        if not kanjis:
            # Fallback to random words if target has no Kanji
            return [w["kanji"] if w["kanji"] else w["hiragana"] for w in random.sample(self.words, min(count, len(self.words)))]

        matches = []
        candidates = list(self.words)
        random.shuffle(candidates)

        for w in candidates:
            w_kanji = w["kanji"] or ""
            if w_kanji == target_word or not w_kanji:
                continue
            if any(c in w_kanji for c in kanjis):
                if w_kanji not in matches:
                    matches.append(w_kanji)
                    if len(matches) >= count:
                        break

        # Pad with random words if needed
        while len(matches) < count and self.words:
            rand_w = random.choice(self.words)
            val = rand_w["kanji"] if rand_w["kanji"] else rand_w["hiragana"]
            if val != target_word and val not in matches:
                matches.append(val)

        return matches[:count]

    def find_phonetic_distractors(self, target_hiragana, count=3):
        """
        Finds words with close pronunciation (Hiragana edit distance <= 2).
        """
        matches = []
        target_len = len(target_hiragana)

        def edit_distance(s1, s2):
            if len(s1) < len(s2):
                return edit_distance(s2, s1)
            if len(s2) == 0:
                return len(s1)
            previous_row = range(len(s2) + 1)
            for i, c1 in enumerate(s1):
                current_row = [i + 1]
                for j, c2 in enumerate(s2):
                    current_row.append(min(
                        previous_row[j + 1] + 1,
                        current_row[j] + 1,
                        previous_row[j] + (c1 != c2)
                    ))
                previous_row = current_row
            return previous_row[-1]

        # Scan words of similar length to optimize
        candidates = [w for w in self.words if abs(len(w["hiragana"]) - target_len) <= 1]
        random.shuffle(candidates)

        for w in candidates:
            h_reading = w["hiragana"]
            if h_reading == target_hiragana:
                continue
            dist = edit_distance(target_hiragana, h_reading)
            if 1 <= dist <= 2:
                val = w["kanji"] if w["kanji"] else h_reading
                if val not in matches:
                    matches.append(val)
                    if len(matches) >= count:
                        break

        # Fallback to random words if needed
        while len(matches) < count and self.words:
            rand_w = random.choice(self.words)
            val = rand_w["kanji"] if rand_w["kanji"] else rand_w["hiragana"]
            if val != target_hiragana and val not in matches:
                matches.append(val)

        return matches[:count]
