const DEFAULT_LABELS = {
  emptyTitle: 'Chưa tìm thấy ký tự phù hợp',
  emptyDescription: 'Hãy thử viết rõ từng nét hoặc vẽ lớn hơn ở giữa ô.',
  suggestedCharacters: 'Ký tự gợi ý',
};

export default function HandwritingCandidates({ candidates, onSelect, labels }) {
  const copy = { ...DEFAULT_LABELS, ...labels };

  if (candidates.length === 0) {
    return (
      <div className="handwriting-candidates__empty">
        <strong>{copy.emptyTitle}</strong>
        <p>{copy.emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="handwriting-candidates" aria-label={copy.suggestedCharacters}>
      {candidates.map((candidate) => (
        <button
          key={candidate.char}
          type="button"
          onClick={() => onSelect(candidate)}
        >
          <strong>{candidate.char}</strong>
          <small>{Math.round(candidate.score * 100)}%</small>
        </button>
      ))}
    </div>
  );
}
