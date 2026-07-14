/**
 * AdminPlaceholderPage — Trang giữ chỗ đẹp cho các tính năng chưa triển khai.
 *
 * Props:
 *   title       string     — tên trang
 *   description string?    — mô tả ngắn
 *   icon        ReactNode? — icon minh họa
 */
export default function AdminPlaceholderPage({
  title,
  description = 'Chức năng này đang được phát triển và sẽ ra mắt trong phiên bản tiếp theo.',
  icon,
}) {
  return (
    <section className="admin-placeholder-page">
      {/* Icon minh họa */}
      <div className="admin-placeholder-page__icon">
        {icon ?? (
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 9h6M9 13h4" />
          </svg>
        )}
      </div>

      <h1>{title}</h1>
      <p>{description}</p>

      <span className="admin-placeholder-page__wip-tag">
        {/* Biểu tượng đồng hồ cát */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 22h14M5 2h14M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
        </svg>
        Đang phát triển
      </span>
    </section>
  );
}
