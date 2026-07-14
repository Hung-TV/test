/**
 * Shared Pagination component — dùng chung cho Kanji và Dictionary.
 *
 * Props:
 *  - currentPage  {number}  — trang hiện tại (0-indexed hoặc 1-indexed tuỳ isOneBased)
 *  - totalPages   {number}  — tổng số trang
 *  - onPageChange {fn}      — callback(newPage) — cùng hệ indexed với currentPage
 *  - isOneBased   {boolean} — true nếu page bắt đầu từ 1 (dictionary backend), mặc định false (0-indexed)
 *  - label        {string}  — aria-label cho navigation
 *  - goToLabel    {string}  — nhãn ô nhập trang
 */
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Pagination.css';

const MAX_VISIBLE = 5;

function buildPageRange(current0, total) {
  if (total <= MAX_VISIBLE) return Array.from({ length: total }, (_, i) => i);
  const half  = Math.floor(MAX_VISIBLE / 2);
  let   start = Math.max(0, current0 - half);
  let   end   = start + MAX_VISIBLE - 1;
  if (end >= total) { end = total - 1; start = end - MAX_VISIBLE + 1; }
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  isOneBased  = false,
  label       = 'Phân trang',
  goToLabel   = 'Đến trang',
}) {
  const [inputVal, setInputVal] = useState('');

  if (!totalPages || totalPages <= 1) return null;

  // Chuẩn hoá sang 0-indexed để render
  const page0   = isOneBased ? currentPage - 1 : currentPage;
  const isFirst = page0 <= 0;
  const isLast  = page0 >= totalPages - 1;
  const pages   = buildPageRange(page0, totalPages);

  const emit = (p0) => {
    // p0 luôn là 0-indexed, chuyển sang đúng hệ khi gọi callback
    onPageChange(isOneBased ? p0 + 1 : p0);
  };

  const commitInput = () => {
    const n = parseInt(inputVal, 10);
    if (Number.isFinite(n) && n >= 1 && n <= totalPages) emit(n - 1);
    setInputVal('');
  };

  return (
    <nav className="pagination" aria-label={label}>
      {/* Prev */}
      <button
        type="button"
        className="pagination__arrow"
        disabled={isFirst}
        onClick={() => emit(page0 - 1)}
        aria-label="Trang trước"
      >
        <ChevronLeft size={15} />
      </button>

      {/* Numbered pages */}
      <div className="pagination__pages">
        {/* First page shortcut */}
        {pages[0] > 0 && (
          <>
            <button type="button" className="pagination__page" onClick={() => emit(0)}>1</button>
            {pages[0] > 1 && <span className="pagination__ellipsis" aria-hidden>…</span>}
          </>
        )}

        {pages.map((p) => (
          <button
            key={p}
            type="button"
            className={`pagination__page${p === page0 ? ' pagination__page--active' : ''}`}
            onClick={() => emit(p)}
            aria-current={p === page0 ? 'page' : undefined}
          >
            {p + 1}
          </button>
        ))}

        {/* Last page shortcut */}
        {pages[pages.length - 1] < totalPages - 1 && (
          <>
            {pages[pages.length - 1] < totalPages - 2 && (
              <span className="pagination__ellipsis" aria-hidden>…</span>
            )}
            <button type="button" className="pagination__page" onClick={() => emit(totalPages - 1)}>
              {totalPages}
            </button>
          </>
        )}
      </div>

      {/* Next */}
      <button
        type="button"
        className="pagination__arrow"
        disabled={isLast}
        onClick={() => emit(page0 + 1)}
        aria-label="Trang sau"
      >
        <ChevronRight size={15} />
      </button>

      {/* Go-to-page */}
      <div className="pagination__goto">
        <span className="pagination__goto-label">{goToLabel}</span>
        <input
          type="number"
          min={1}
          max={totalPages}
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') commitInput(); }}
          onBlur={commitInput}
          className="pagination__goto-input"
          aria-label={goToLabel}
        />
      </div>
    </nav>
  );
}
