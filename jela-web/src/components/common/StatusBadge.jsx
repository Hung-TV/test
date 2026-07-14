/**
 * Component hiển thị Badge trạng thái chung cho toàn app.
 *
 * @param {string} status - Các trạng thái phổ biến: 'active', 'inactive', 'locked', 'pending'
 * @param {string} customLabel - Label hiển thị (tuỳ chọn, ghi đè label mặc định theo status)
 */
export default function StatusBadge({ status, customLabel }) {
  let label = customLabel;
  let variant;

  switch (status) {
    case 'active':
      label = label || 'Hoạt động';
      variant = 'active';
      break;
    case 'inactive':
      label = label || 'Tạm khóa';
      variant = 'inactive';
      break;
    case 'locked':
    case 'REJECTED':
      label = label || (status === 'REJECTED' ? 'Từ chối' : 'Đã khóa');
      variant = 'error';
      break;
    case 'pending':
    case 'PENDING':
      label = label || (status === 'PENDING' ? 'Chờ xử lý' : 'Chờ duyệt');
      variant = 'warning';
      break;
    case 'PROCESSING':
      label = label || 'Đang xử lý';
      variant = 'info';
      break;
    case 'RESOLVED':
      label = label || 'Đã giải quyết';
      variant = 'active';
      break;
    default:
      label = label || status;
      variant = 'info';
  }

  return (
    <span className={`admin-badge admin-badge--${variant}`}>
      {label}
    </span>
  );
}
