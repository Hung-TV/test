/**
 * StatCard — Thẻ thống kê dùng chung trên Admin Dashboard.
 *
 * Props:
 *   icon      ReactNode — icon hiển thị (từ AppIcons)
 *   iconColor string    — "teal" | "blue" | "amber" | "red" | "purple"
 *   label     string    — nhãn chỉ số (ví dụ: "Tổng học viên")
 *   value     string    — giá trị (ví dụ: "1,248")
 *   trend     string?   — text xu hướng (ví dụ: "+12% so với tháng trước")
 */
export default function StatCard({ icon, iconColor = 'teal', label, value, trend }) {
  return (
    <div className="admin-stat-card">
      <div className={`admin-stat-card__icon admin-stat-card__icon--${iconColor}`}>
        {icon}
      </div>
      <div className="admin-stat-card__info">
        <p>{label}</p>
        <h3>{value}</h3>
        {trend && (
          <span style={{ fontSize: 12, color: 'var(--admin-color-on-surface-variant)', marginTop: 4, display: 'block' }}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
