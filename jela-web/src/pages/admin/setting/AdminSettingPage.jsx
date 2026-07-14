import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { GearIcon, WrenchIcon } from '../../../components/common/AppIcons';
import adminSettingsService from '../../../services/admin/adminSettingsService';
// Page tiếp tục dùng tên field cũ để giữ nguyên layout và validation giao diện.
// Service chuẩn hóa các field này về contract API mới trước khi lưu.

const DEFAULT_SETTINGS = {
  appName: 'JELA - Japanese Education Learning App',
  allowRegistration: true,
  allowGoogleLogin: true,
  defaultLevel: 'N5',
  defaultQuizQuestions: 10,
  quizPassingScore: 8,
  maintenanceMode: false,
  maintenanceMessage: 'Hệ thống đang được bảo trì định kỳ. Vui lòng quay lại sau ít phút.'
};

export default function AdminSettingPage() {
  const [settings, setSettings] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isActive = true;

    adminSettingsService.getSystemSettings()
      .then((data) => {
        if (!isActive) return;
        setSettings(data);
        setError(null);
      })
      .catch(() => {
        if (isActive) setError('Lỗi khi tải cấu hình hệ thống');
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = value;

    // Xử lý radio "bật/tắt" map thành boolean
    if (type === 'radio') {
      newValue = value === 'true';
    } else if (type === 'number') {
      newValue = parseInt(value, 10);
    } else if (type === 'checkbox') {
      newValue = checked;
    }

    setSettings(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await adminSettingsService.updateSystemSettings(settings);
      toast.success('Cập nhật cấu hình hệ thống thành công!');
    } catch (err) {
      toast.error(err.message || 'Lỗi khi lưu cấu hình');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Bạn có chắc chắn muốn khôi phục toàn bộ cấu hình về mặc định?')) {
      setSettings(DEFAULT_SETTINGS);
      toast.success('Đã khôi phục cấu hình mặc định. Hãy lưu để áp dụng.');
    }
  };

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: 48, color: 'var(--admin-color-on-surface-variant)' }}>Đang tải cấu hình...</div>;
  }

  if (error || !settings) {
    return <div style={{ textAlign: 'center', padding: 48, color: 'var(--admin-color-error)' }}>{error || 'Không tải được cấu hình'}</div>;
  }

  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-page-header__text">
          <h1>Cài đặt hệ thống</h1>
          <p>Cấu hình các thông số cốt lõi của ứng dụng JELA</p>
        </div>
      </div>

      <form className="admin-form-container" style={{ maxWidth: 800 }} onSubmit={handleSave}>
        
        {/* Section 1: Thông tin chung */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, borderBottom: '1px solid var(--admin-color-outline)', paddingBottom: 8 }}>
            <GearIcon size={20} style={{ color: 'var(--admin-color-primary)' }} />
            <h3 style={{ margin: 0, fontSize: 16, color: 'var(--admin-color-navy)' }}>Cấu hình chung</h3>
          </div>
          
          <div className="admin-form-group" style={{ marginBottom: 16 }}>
            <label className="admin-form-label">Tên ứng dụng</label>
            <input type="text" name="appName" className="admin-form-input" value={settings.appName} onChange={handleChange} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div className="admin-form-group">
              <label className="admin-form-label">Cho phép Đăng ký mới</label>
              <div className="admin-form-radio-group">
                <label className="admin-form-radio">
                  <input type="radio" name="allowRegistration" value="true" checked={settings.allowRegistration === true} onChange={handleChange} /> Bật
                </label>
                <label className="admin-form-radio">
                  <input type="radio" name="allowRegistration" value="false" checked={settings.allowRegistration === false} onChange={handleChange} /> Tắt
                </label>
              </div>
            </div>
            
            <div className="admin-form-group">
              <label className="admin-form-label">Đăng nhập Google (OAuth)</label>
              <div className="admin-form-radio-group">
                <label className="admin-form-radio">
                  <input type="radio" name="allowGoogleLogin" value="true" checked={settings.allowGoogleLogin === true} onChange={handleChange} /> Bật
                </label>
                <label className="admin-form-radio">
                  <input type="radio" name="allowGoogleLogin" value="false" checked={settings.allowGoogleLogin === false} onChange={handleChange} /> Tắt
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Cấu hình Học tập */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, borderBottom: '1px solid var(--admin-color-outline)', paddingBottom: 8 }}>
            <WrenchIcon size={20} style={{ color: 'var(--admin-color-primary)' }} />
            <h3 style={{ margin: 0, fontSize: 16, color: 'var(--admin-color-navy)' }}>Cấu hình Học tập & Bài kiểm tra</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div className="admin-form-group">
              <label className="admin-form-label">Level mặc định (User mới)</label>
              <select name="defaultLevel" className="admin-select" value={settings.defaultLevel} onChange={handleChange}>
                <option value="N5">N5</option>
                <option value="N4">N4</option>
                <option value="N3">N3</option>
                <option value="N2">N2</option>
                <option value="N1">N1</option>
              </select>
            </div>
            
            <div className="admin-form-group">
              <label className="admin-form-label">Số câu Quiz mỗi lượt</label>
              <input type="number" name="defaultQuizQuestions" min="5" max="50" className="admin-form-input" value={settings.defaultQuizQuestions} onChange={handleChange} required />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Điểm đạt (Pass Score)</label>
              <input type="number" name="quizPassingScore" min="1" max={settings.defaultQuizQuestions} className="admin-form-input" value={settings.quizPassingScore} onChange={handleChange} required />
            </div>
          </div>
        </div>

        {/* Section 3: Chế độ bảo trì */}
        <div style={{ marginBottom: 24, padding: 16, background: settings.maintenanceMode ? 'var(--admin-color-error-container)' : 'var(--admin-color-surface-container-highest)', borderRadius: 8 }}>
          <div className="admin-form-group" style={{ marginBottom: 16 }}>
            <label className="admin-form-label" style={{ color: settings.maintenanceMode ? 'var(--admin-color-error)' : 'inherit' }}>
              Chế độ Bảo trì Hệ thống
            </label>
            <div className="admin-form-radio-group">
              <label className="admin-form-radio">
                <input type="radio" name="maintenanceMode" value="true" checked={settings.maintenanceMode === true} onChange={handleChange} /> Bật
              </label>
              <label className="admin-form-radio">
                <input type="radio" name="maintenanceMode" value="false" checked={settings.maintenanceMode === false} onChange={handleChange} /> Tắt
              </label>
            </div>
          </div>

          {settings.maintenanceMode && (
            <div className="admin-form-group">
              <label className="admin-form-label">Thông báo Bảo trì</label>
              <textarea 
                name="maintenanceMessage" 
                className="admin-form-textarea" 
                value={settings.maintenanceMessage} 
                onChange={handleChange}
                style={{ borderColor: 'var(--admin-color-error)', minHeight: 60 }}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="admin-form-actions">
          <button type="button" className="admin-btn admin-btn--outline" onClick={handleReset} disabled={isSaving}>
            Khôi phục mặc định
          </button>
          <button type="submit" className="admin-btn admin-btn--primary" disabled={isSaving}>
            {isSaving ? 'Đang lưu...' : 'Lưu cấu hình'}
          </button>
        </div>
      </form>
    </div>
  );
}
