import { Link } from 'react-router-dom';

export default function Brand({ compact = false, to = '/' }) {
  return (
    <Link
      to={to}
      className={`app-brand${compact ? ' app-brand--compact' : ''}`}
      title="Về trang chủ"
      style={{ textDecoration: 'none' }}
    >
      <div className="app-brand__mark" aria-hidden="true">文</div>
      {!compact && (
        <div>
          <strong>JELA</strong>
          <span>Học tiếng Nhật</span>
        </div>
      )}
    </Link>
  );
}
