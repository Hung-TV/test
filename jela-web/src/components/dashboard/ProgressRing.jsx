export default function ProgressRing({ value, label }) {
  const safeValue = Math.min(100, Math.max(0, value));

  return (
    <div
      className="progress-ring"
      style={{ '--progress': `${safeValue * 3.6}deg` }}
      role="img"
      aria-label={`${label}: ${safeValue}%`}
    >
      <div className="progress-ring__center">
        <strong>{safeValue}%</strong>
      </div>
    </div>
  );
}
