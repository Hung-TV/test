/**
 * AdminTable — Bảng dữ liệu dùng chung, có header card với title và action slot.
 *
 * Props:
 *   title      string        — tiêu đề thẻ bảng
 *   columns    Array<{ key, label, render? }> — cột (render tùy chọn)
 *   rows       Array<object> — dữ liệu
 *   action     ReactNode?    — nút bên phải header (ví dụ: nút "Thêm mới")
 *   emptyText  string?       — text khi không có dữ liệu
 */
export default function AdminTable({ title, columns, rows, action, emptyText = 'Không có dữ liệu.' }) {
  return (
    <div className="admin-table-card">
      <div className="admin-table-card__header">
        <h3>{title}</h3>
        {action && <div>{action}</div>}
      </div>

      {rows.length === 0 ? (
        <p style={{ padding: '24px', color: 'var(--admin-color-on-surface-variant)', textAlign: 'center' }}>
          {emptyText}
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.key}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.id ?? i}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
