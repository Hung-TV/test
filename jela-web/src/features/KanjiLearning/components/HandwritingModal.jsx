
export default function HandwritingModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="handwriting-modal-overlay" onClick={onClose}>
      <div className="handwriting-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="handwriting-modal-header">
          <h2 className="handwriting-modal-title">Handwriting Input</h2>
          <button className="handwriting-modal-close" onClick={onClose} aria-label="Close modal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="handwriting-canvas-placeholder">
          Canvas component will be loaded here. <br />
          Draw kanji to search.
        </div>
        
        <div style={{ padding: '0 24px 24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button 
            onClick={onClose}
            style={{
              padding: '8px 16px',
              border: '1px solid var(--color-outline-variant)',
              borderRadius: '8px',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            Clear
          </button>
          <button 
            onClick={onClose}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
