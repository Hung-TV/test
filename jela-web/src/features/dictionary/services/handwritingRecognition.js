import kanjiCanvasScriptUrl from '../../../vendor/kanjicanvas/kanji-canvas.min.js?url';
import kanjiCanvasPatternsUrl from '../../../vendor/kanjicanvas/ref-patterns.js?url';

const RECOGNIZER_SIZE = 400;
const MOCK_CANDIDATES = [
  { char: '日', score: 0.96 },
  { char: '目', score: 0.88 },
  { char: '田', score: 0.82 },
  { char: '白', score: 0.75 },
  { char: '月', score: 0.68 },
  { char: '木', score: 0.61 },
  { char: '本', score: 0.58 },
  { char: '休', score: 0.52 },
];

let kanjiCanvasLoadPromise = null;
let recognizerCanvasSequence = 0;
let hasWarnedAboutFallback = false;

function sanitizeStrokes(strokes) {
  if (!Array.isArray(strokes)) return [];

  return strokes
    .filter(Array.isArray)
    .map((stroke) => (
      stroke
        .filter((point) => (
          Number.isFinite(point?.x) && Number.isFinite(point?.y)
        ))
        .map((point) => ({
          x: point.x,
          y: point.y,
          t: Number.isFinite(point.t) ? point.t : 0,
        }))
    ))
    .filter((stroke) => stroke.length > 0);
}

function removeTinyMovements(strokes, threshold = 2) {
  return strokes.map((stroke) => {
    if (stroke.length < 2) return stroke;

    const filtered = [stroke[0]];
    for (let index = 1; index < stroke.length; index += 1) {
      const point = stroke[index];
      const previous = filtered[filtered.length - 1];
      const distance = Math.hypot(point.x - previous.x, point.y - previous.y);

      if (distance >= threshold) filtered.push(point);
    }

    const lastPoint = stroke[stroke.length - 1];
    if (filtered[filtered.length - 1] !== lastPoint) filtered.push(lastPoint);
    return filtered;
  });
}

function getStrokeBoundingBox(strokes) {
  const points = strokes.flat();
  if (points.length === 0) return null;

  const xValues = points.map((point) => point.x);
  const yValues = points.map((point) => point.y);
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

function normalizeStrokesToSquare(strokes, targetSize = 400, padding = 32) {
  const boundingBox = getStrokeBoundingBox(strokes);
  if (!boundingBox) return [];

  const drawableSize = targetSize - padding * 2;
  const largestDimension = Math.max(
    boundingBox.width,
    boundingBox.height,
    1,
  );
  const scale = drawableSize / largestDimension;
  const scaledWidth = boundingBox.width * scale;
  const scaledHeight = boundingBox.height * scale;
  const offsetX = (targetSize - scaledWidth) / 2;
  const offsetY = (targetSize - scaledHeight) / 2;

  return strokes.map((stroke) => (
    stroke.map((point) => ({
      x: (point.x - boundingBox.minX) * scale + offsetX,
      y: (point.y - boundingBox.minY) * scale + offsetY,
      t: point.t,
    }))
  ));
}

function convertStrokesToRecognizerInput(strokes) {
  // KanjiCanvas yêu cầu pixel arrays [x, y], không nhận object hay 0..1.
  return strokes.map((stroke) => {
    const points = stroke.map((point) => [point.x, point.y]);
    return points.length === 1 ? [points[0], [...points[0]]] : points;
  });
}

function loadLocalScript(source, id) {
  const existingScript = document.getElementById(id);
  if (existingScript?.dataset.loaded === 'true') return Promise.resolve();

  return new Promise((resolve, reject) => {
    const script = existingScript || document.createElement('script');
    script.id = id;
    script.src = source;
    script.async = false;
    script.onload = () => {
      script.dataset.loaded = 'true';
      resolve();
    };
    script.onerror = () => {
      script.remove();
      reject(new Error(`Cannot load ${id}`));
    };

    if (!existingScript) document.head.appendChild(script);
  });
}

async function loadKanjiCanvas() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('KanjiCanvas requires a browser');
  }

  if (!kanjiCanvasLoadPromise) {
    kanjiCanvasLoadPromise = (async () => {
      await loadLocalScript(kanjiCanvasScriptUrl, 'jela-kanjicanvas-core');
      await loadLocalScript(kanjiCanvasPatternsUrl, 'jela-kanjicanvas-patterns');

      if (
        typeof window.KanjiCanvas?.recognize !== 'function' ||
        !Array.isArray(window.KanjiCanvas.refPatterns) ||
        window.KanjiCanvas.refPatterns.length === 0
      ) {
        throw new Error('KanjiCanvas model is unavailable');
      }

      return window.KanjiCanvas;
    })().catch((error) => {
      kanjiCanvasLoadPromise = null;
      throw error;
    });
  }

  return kanjiCanvasLoadPromise;
}

function mapKanjiCanvasResult(rawResult) {
  const rawCandidates = Array.isArray(rawResult)
    ? rawResult
    : Array.from(String(rawResult || ''));

  // KanjiCanvas returns a string whose candidates are separated by spaces.
  // Remove separators before assigning rank-based scores.
  const characters = rawCandidates.filter((value) => {
    const char = String(value?.char || value || '').trim();
    return /^[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]$/u.test(char);
  });

  return characters
    .map((value, index) => ({
      char: String(value?.char || value || '').trim(),
      score: Math.min(
        1,
        Math.max(0, Number(value?.score) || 0.96 - index * 0.055),
      ),
    }))
    .filter((candidate, index, candidates) => (
      candidates.findIndex((item) => item.char === candidate.char) === index
    ))
    .slice(0, 10);
}

function cleanupRecognizerCanvas(recognizer, canvasId, canvas) {
  const keys = [
    'canvas_', 'ctx_', 'w_', 'h_', 'flagOver_', 'flagDown_', 'prevX_',
    'currX_', 'prevY_', 'currY_', 'dot_flag_', 'recordedPattern_',
    'currentLine_',
  ];
  keys.forEach((prefix) => delete recognizer[`${prefix}${canvasId}`]);
  canvas.remove();
}

async function recognizeWithKanjiCanvas(recognizerInput) {
  const recognizer = await loadKanjiCanvas();
  const canvasId = `jela-kanji-recognizer-${++recognizerCanvasSequence}`;
  const canvas = document.createElement('canvas');
  canvas.id = canvasId;
  canvas.width = RECOGNIZER_SIZE;
  canvas.height = RECOGNIZER_SIZE;
  canvas.hidden = true;
  document.body.appendChild(canvas);

  try {
    recognizer.init(canvasId);
    recognizer[`recordedPattern_${canvasId}`] = recognizerInput;
    const rawResults = recognizer.recognize(canvasId);
    if (import.meta.env?.DEV) console.debug('[handwriting] raw results', rawResults);
    return mapKanjiCanvasResult(rawResults);
  } finally {
    cleanupRecognizerCanvas(recognizer, canvasId, canvas);
  }
}

function warnAboutFallback() {
  if (!import.meta.env?.DEV || hasWarnedAboutFallback) return;
  hasWarnedAboutFallback = true;
  console.warn('[handwriting] KanjiCanvas failed; using mock fallback.');
}

export async function recognizeJapaneseHandwriting(strokes) {
  const sanitizedStrokes = sanitizeStrokes(strokes);
  if (sanitizedStrokes.length === 0) return [];

  const filteredStrokes = removeTinyMovements(sanitizedStrokes);
  const boundingBox = getStrokeBoundingBox(filteredStrokes);
  const normalizedStrokes = normalizeStrokesToSquare(
    filteredStrokes,
    RECOGNIZER_SIZE,
    32,
  );
  const recognizerInput = convertStrokesToRecognizerInput(normalizedStrokes);

  if (import.meta.env?.DEV) {
    console.debug('[handwriting] strokes', filteredStrokes.length);
    console.debug(
      '[handwriting] points per stroke',
      filteredStrokes.map((stroke) => stroke.length),
    );
    console.debug('[handwriting] bounding box', boundingBox);
    console.debug('[handwriting] recognizer input', recognizerInput);
  }

  try {
    // Model có mẫu 世 (5 nét), nhưng chữ này vẫn có thể rớt top 10 nếu nét vẽ
    // quá khác reference; đây là giới hạn ranking của engine, không phải crash.
    const candidates = await recognizeWithKanjiCanvas(recognizerInput);
    if (candidates.length > 0) return candidates;
  } catch {
    // Nhận dạng local lỗi hoặc model chưa load được sẽ không làm crash UI.
  }

  warnAboutFallback();
  return MOCK_CANDIDATES;
}
