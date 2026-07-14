const ROLE_COLORS = {
  USER: { bg: '#e0f2fe', text: '#0369a1', label: 'Học viên' }, // Blue
  TUTOR: { bg: '#f3e8ff', text: '#7e22ce', label: 'Giáo viên' }, // Purple
  ADMIN: { bg: '#fee2e2', text: '#b91c1c', label: 'Quản trị viên' } // Red
};

export default function RoleBadge({ role }) {
  const config = ROLE_COLORS[role] || { bg: '#f1f5f9', text: '#475569', label: role };

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 8px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: '600',
      backgroundColor: config.bg,
      color: config.text,
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    }}>
      {config.label}
    </span>
  );
}
