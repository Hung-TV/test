import { useEffect, useRef, useState } from 'react';
import { Eraser, RotateCcw, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useHandwritingCanvas } from '../hooks/useHandwritingCanvas';
import { recognizeJapaneseHandwriting } from '../services/handwritingRecognition';
import HandwritingCandidates from './HandwritingCandidates';
import HandwritingCanvas from './HandwritingCanvas';
import { useDictionaryI18n } from '../hooks/useDictionaryI18n';

const DEFAULT_LABELS = {
  eyebrow: 'JELA DICTIONARY',
  title: 'Vẽ chữ để tra từ',
  description: 'Vẽ Kanji cần tra, sau đó chọn ký tự phù hợp trong danh sách gợi ý.',
  close: 'Đóng',
  drawFirst: 'Hãy vẽ chữ trước khi tra cứu',
  clearAll: 'Xóa tất cả',
  undo: 'Hoàn tác',
  recognizing: 'Đang nhận dạng...',
  recognize: 'Tra cứu',
  candidates: 'Kết quả gợi ý',
  characterCount: (count) => `${count} ký tự`,
};

export default function HandwritingModal({
  isOpen,
  onClose,
  onSelectCandidate,
  labels,
}) {
  const { messages } = useDictionaryI18n();
  const copy = {
    ...DEFAULT_LABELS,
    ...messages.handwritingModal,
    ...labels,
  };
  const [candidates, setCandidates] = useState([]);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const canvas = useHandwritingCanvas();
  const recognitionTimerRef = useRef(null);
  const recognitionRequestRef = useRef(0);

  const cancelPendingRecognition = () => {
    if (recognitionTimerRef.current) {
      clearTimeout(recognitionTimerRef.current);
      recognitionTimerRef.current = null;
    }
    recognitionRequestRef.current += 1;
  };

  const resetModal = () => {
    cancelPendingRecognition();
    canvas.clearStrokes();
    setCandidates([]);
    setIsRecognizing(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key === 'Escape') handleClose();
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    };
  });

  useEffect(() => () => {
    if (recognitionTimerRef.current) {
      clearTimeout(recognitionTimerRef.current);
    }
  }, []);

  if (!isOpen) return null;

  const recognizeStrokes = async (strokes, showEmptyToast = false) => {
    if (!Array.isArray(strokes) || strokes.length === 0) {
      if (showEmptyToast) toast.error(copy.drawFirst);
      return;
    }

    const requestId = ++recognitionRequestRef.current;
    setIsRecognizing(true);
    try {
      const results = await recognizeJapaneseHandwriting(strokes);
      if (requestId === recognitionRequestRef.current) {
        setCandidates(results);
      }
    } finally {
      if (requestId === recognitionRequestRef.current) {
        setIsRecognizing(false);
      }
    }
  };

  const handleRecognize = () => {
    if (!canvas.hasStrokes) {
      toast.error(copy.drawFirst);
      return;
    }

    cancelPendingRecognition();
    const recognitionStrokes = canvas.currentStroke.length > 0
      ? [...canvas.strokes, canvas.currentStroke]
      : canvas.strokes;
    recognizeStrokes(recognitionStrokes, true);
  };

  const handleStrokeEnd = (committedStrokes) => {
    cancelPendingRecognition();
    if (committedStrokes.length === 0) return;

    recognitionTimerRef.current = setTimeout(() => {
      recognitionTimerRef.current = null;
      recognizeStrokes(committedStrokes);
    }, 300);
  };

  const handleSelectCandidate = (candidate) => {
    // Modal chỉ phát ký tự đã chọn; DictionaryPage quyết định replace/append,
    // mở suggestion và đóng modal. Không gọi Dictionary API tại đây.
    resetModal();
    onSelectCandidate(candidate.char);
  };

  const handleClear = () => {
    cancelPendingRecognition();
    canvas.clearStrokes();
    setCandidates([]);
  };

  const handleUndo = () => {
    cancelPendingRecognition();
    const remainingStrokes = canvas.undoStroke();
    setCandidates([]);

    if (remainingStrokes.length > 0) {
      recognitionTimerRef.current = setTimeout(() => {
        recognitionTimerRef.current = null;
        recognizeStrokes(remainingStrokes);
      }, 300);
    }
  };

  return (
    <div
      className="dictionary-modal-backdrop handwriting-modal-backdrop"
      role="presentation"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}
    >
      <section
        className="handwriting-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="handwriting-modal-title"
      >
        <header className="handwriting-modal__header">
          <div>
            <p>{copy.eyebrow}</p>
            <h2 id="handwriting-modal-title">{copy.title}</h2>
            <span className="handwriting-modal__description">
              {copy.description}
            </span>
          </div>
          <button type="button" aria-label={copy.close} onClick={handleClose}>
            <X size={21} />
          </button>
        </header>

        <div className="handwriting-modal__body">
          <div className="handwriting-drawing-panel">
            <HandwritingCanvas
              strokes={canvas.strokes}
              currentStroke={canvas.currentStroke}
              startStroke={canvas.startStroke}
              addPoint={canvas.addPoint}
              endStroke={canvas.endStroke}
              onStrokeEnd={handleStrokeEnd}
            />

            <div className="handwriting-drawing-actions">
              <button type="button" onClick={handleClear}>
                <Eraser size={17} /> {copy.clearAll}
              </button>
              <button
                type="button"
                disabled={!canvas.hasStrokes}
                onClick={handleUndo}
              >
                <RotateCcw size={17} /> {copy.undo}
              </button>
              <button
                type="button"
                className="handwriting-recognize-button"
                disabled={isRecognizing}
                onClick={handleRecognize}
              >
                <Search size={17} />
                {isRecognizing ? copy.recognizing : copy.recognize}
              </button>
            </div>
          </div>

          <aside className="handwriting-results-panel">
            <div className="handwriting-results-panel__heading">
              <h3>{copy.candidates}</h3>
              <span>{copy.characterCount(candidates.length)}</span>
            </div>
            {isRecognizing ? (
              <div className="handwriting-results-loading" role="status">
                <span className="dictionary-spinner" aria-hidden="true" />
                {copy.recognizing}
              </div>
            ) : null}
            <HandwritingCandidates
              candidates={candidates}
              onSelect={handleSelectCandidate}
              labels={copy}
            />
          </aside>
        </div>
      </section>
    </div>
  );
}
