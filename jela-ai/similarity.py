import json
import os
import re
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# Constants
IDS_OPERATORS = set("⿰⿱⿲⿳⿴⿵⿶⿷⿸⿺⿎⿻")
KANJI_JSON_PATH = os.path.join(os.path.dirname(__file__), "..", "data-import", "kanji_bank_jlpt.json")

class KanjiSimilarityModel:
    def __init__(self):
        self.kanjis = []
        self.kanji_by_char = {}
        self.meanings_embeddings = None
        self.semantic_model = None
        self.load_data()
        self.init_semantic_model()

    def load_data(self):
        if not os.path.exists(KANJI_JSON_PATH):
            raise FileNotFoundError(f"Kanji JSON file not found at {KANJI_JSON_PATH}")

        with open(KANJI_JSON_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)

        for entry in data:
            char = entry[0]
            reading = entry[1] or ""
            meanings = entry[4] if entry[4] else []
            attrs = entry[5] if isinstance(entry[5], dict) else {}

            strokes_raw = attrs.get("Strokes")
            strokes = int(strokes_raw) if strokes_raw and str(strokes_raw).isdigit() else None
            radical = attrs.get("Radical", "")
            shape = attrs.get("Shape", "")
            jlpt = attrs.get("jlpt", "N5")
            readings_on = attrs.get("readings_on", [])
            readings_kun = attrs.get("readings_kun", [])

            # Extract component characters from shape
            shape_components = set(shape) - IDS_OPERATORS - {char} if shape else set()

            kanji_item = {
                "character": char,
                "reading": reading,
                "meanings": meanings,
                "strokes": strokes,
                "radical": radical,
                "shape": shape,
                "shape_components": shape_components,
                "jlpt": jlpt,
                "readings_on": readings_on,
                "readings_kun": readings_kun,
                "combined_meanings_text": " ".join(meanings)
            }
            self.kanjis.append(kanji_item)
            self.kanji_by_char[char] = kanji_item

        print(f"Loaded {len(self.kanjis)} Kanji characters.")

    def init_semantic_model(self):
        print("Initializing multilingual SentenceTransformer model...")
        # Use a lightweight multilingual sentence transformer model
        self.semantic_model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")
        
        texts = [k["combined_meanings_text"] for k in self.kanjis]
        print("Precomputing semantic embeddings for all kanji meanings...")
        self.meanings_embeddings = self.semantic_model.encode(texts, show_progress_bar=False, convert_to_numpy=True)
        print("Semantic embeddings precomputation complete.")

    def find_distractors(self, target_char, distractor_type="visual", count=3):
        """
        Find 3 distracting kanji options for the target kanji.
        distractor_type can be:
        - "visual": based on shape components, radical, and stroke count
        - "semantic": based on meaning vector similarity
        - "phonetic": based on reading or sound similarity
        """
        target = self.kanji_by_char.get(target_char)
        if not target:
            return []

        candidates = []
        target_idx = -1

        for idx, k in enumerate(self.kanjis):
            if k["character"] == target_char:
                target_idx = idx
                continue
            candidates.append((idx, k))

        scores = []
        if distractor_type == "semantic" and self.meanings_embeddings is not None and target_idx != -1:
            # Semantic cosine similarity
            target_emb = self.meanings_embeddings[target_idx].reshape(1, -1)
            cand_embs = self.meanings_embeddings[[c[0] for c in candidates]]
            sim_scores = cosine_similarity(target_emb, cand_embs)[0]
            
            for i, (idx, cand) in enumerate(candidates):
                # Penalize candidates from vastly different JLPT levels to keep it realistic
                jlpt_penalty = 1.0
                if target["jlpt"] and cand["jlpt"]:
                    t_lvl = int(target["jlpt"][1]) # e.g. "N3" -> 3
                    c_lvl = int(cand["jlpt"][1])
                    if abs(t_lvl - c_lvl) >= 3:
                        jlpt_penalty = 0.5
                scores.append((cand["character"], sim_scores[i] * jlpt_penalty))

        elif distractor_type == "visual":
            for idx, cand in candidates:
                score = 0.0
                # 1. Stroke count similarity (within +/- 3 strokes)
                if target["strokes"] is not None and cand["strokes"] is not None:
                    diff = abs(target["strokes"] - cand["strokes"])
                    if diff <= 3:
                        score += (4 - diff) * 1.5 # max +6 points

                # 2. Radical similarity
                t_rad = target["radical"].split(" ")[0] if target["radical"] else ""
                c_rad = cand["radical"].split(" ")[0] if cand["radical"] else ""
                if t_rad and c_rad and t_rad == c_rad:
                    score += 5.0 # +5 points

                # 3. Shape component overlap
                shared_components = target["shape_components"].intersection(cand["shape_components"])
                score += len(shared_components) * 4.0 # +4 points per shared component

                # 4. Containment check (one contains the other)
                if target["character"] in cand["shape"]:
                    score += 8.0
                if cand["character"] in target["shape"]:
                    score += 8.0

                # 5. JLPT level compatibility
                if target["jlpt"] == cand["jlpt"]:
                    score += 1.0

                scores.append((cand["character"], score))

        elif distractor_type == "phonetic":
            for idx, cand in candidates:
                score = 0.0
                # 1. Sino-vietnamese reading similarity
                if target["reading"] and cand["reading"]:
                    t_readings = set(target["reading"].lower().split())
                    c_readings = set(cand["reading"].lower().split())
                    if t_readings.intersection(c_readings):
                        score += 6.0
                
                # 2. Onyomi overlap
                t_on = set(target["readings_on"])
                c_on = set(cand["readings_on"])
                if t_on.intersection(c_on):
                    score += 4.0

                # 3. Kunyomi overlap
                t_kun = set(target["readings_kun"])
                c_kun = set(cand["readings_kun"])
                if t_kun.intersection(c_kun):
                    score += 4.0

                # Fallback to visual/strokes if no phonetic overlap
                if target["strokes"] is not None and cand["strokes"] is not None:
                    diff = abs(target["strokes"] - cand["strokes"])
                    if diff <= 2:
                        score += 1.0

                scores.append((cand["character"], score))

        # Sort descending by score
        scores.sort(key=lambda x: x[1], reverse=True)

        # Return top N characters
        distractors = [item[0] for item in scores[:count]]
        return distractors
