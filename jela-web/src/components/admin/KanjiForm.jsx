import { useState } from 'react';
import { checkKanjiExists } from '../../services/admin/adminKanjiService';

const DEFAULT_FORM_DATA = {
  kanji: '',
  meaning: '',
  onyomi: '',
  kunyomi: '',
  level: 'N5',
  strokes: 1,
  radical: '',
  suggestedVocab: '',
  status: 'active'
};

export default function KanjiForm({ initialData, onSubmit, onCancel, isSubmitting }) {
  const [formData, setFormData] = useState(() => initialData || DEFAULT_FORM_DATA);
  const [errors, setErrors] = useState({});
  const [existingKanjiInfo, setExistingKanjiInfo] = useState(null);

  const handleKanjiBlur = async () => {
    const kanjiVal = formData.kanji.trim();
    if (!kanjiVal) {
      setExistingKanjiInfo(null);
      return;
    }

    if (initialData && initialData.kanji === kanjiVal) {
      setExistingKanjiInfo(null);
      return;
    }

    try {
      const res = await checkKanjiExists(kanjiVal);
      if (res && res.exists) {
        setExistingKanjiInfo(res);
        setErrors(prev => ({
          ...prev,
          kanji: 'Cảnh báo: Chữ Kanji này đã tồn tại trên hệ thống!'
        }));
      } else {
        setExistingKanjiInfo(null);
        if (errors.kanji && errors.kanji.includes('tồn tại')) {
          setErrors(prev => ({ ...prev, kanji: null }));
        }
      }
    } catch (e) {
      // Ignore network errors for warning checks
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for the field being edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.kanji.trim()) newErrors.kanji = 'Kanji không được để trống';
    if (!formData.meaning.trim()) newErrors.meaning = 'Nghĩa không được để trống';
    if (!formData.level) newErrors.level = 'Cấp độ là bắt buộc';
    if (!formData.strokes || parseInt(formData.strokes) < 1) newErrors.strokes = 'Số nét phải là số dương';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...formData,
        strokes: parseInt(formData.strokes) // Đảm bảo strokes là số
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form-container">
      <div className="admin-form-grid">
        {/* Kanji */}
        <div className="admin-form-group">
          <label className="admin-form-label">
            Kanji <span className="admin-form-label__required">*</span>
          </label>
          <input
            type="text"
            name="kanji"
            className="admin-form-input"
            style={{ fontSize: 24, fontFamily: 'Noto Sans JP' }}
            value={formData.kanji}
            onChange={handleChange}
            onBlur={handleKanjiBlur}
            placeholder="Ví dụ: 学"
          />
          {errors.kanji && <span className="admin-form-error">{errors.kanji}</span>}
          {existingKanjiInfo && (
            <div className="admin-form-warning-box" style={{
              marginTop: 6,
              padding: 10,
              borderLeft: '4px solid var(--admin-color-error, #ea4335)',
              backgroundColor: 'rgba(234, 67, 53, 0.08)',
              borderRadius: 4,
              fontSize: 13
            }}>
              <strong>Thông tin Kanji hiện tại:</strong><br />
              - Hán tự: <span style={{ fontFamily: 'Noto Sans JP', fontWeight: 'bold' }}>{existingKanjiInfo.character}</span><br />
              - Nghĩa: <strong>{existingKanjiInfo.meaning}</strong><br />
              - Cấp độ: <span className="admin-badge admin-badge--info" style={{ display: 'inline-block', padding: '2px 6px', fontSize: 11 }}>{existingKanjiInfo.jlpt}</span>
            </div>
          )}
        </div>

        {/* Meaning */}
        <div className="admin-form-group">
          <label className="admin-form-label">
            Nghĩa tiếng Việt <span className="admin-form-label__required">*</span>
          </label>
          <input
            type="text"
            name="meaning"
            className="admin-form-input"
            value={formData.meaning}
            onChange={handleChange}
            placeholder="Ví dụ: Học tập"
          />
          {errors.meaning && <span className="admin-form-error">{errors.meaning}</span>}
        </div>

        {/* Onyomi */}
        <div className="admin-form-group">
          <label className="admin-form-label">Onyomi</label>
          <input
            type="text"
            name="onyomi"
            className="admin-form-input"
            value={formData.onyomi}
            onChange={handleChange}
            placeholder="Ví dụ: ガク"
          />
        </div>

        {/* Kunyomi */}
        <div className="admin-form-group">
          <label className="admin-form-label">Kunyomi</label>
          <input
            type="text"
            name="kunyomi"
            className="admin-form-input"
            value={formData.kunyomi}
            onChange={handleChange}
            placeholder="Ví dụ: まな"
          />
        </div>

        {/* Level */}
        <div className="admin-form-group">
          <label className="admin-form-label">
            JLPT Level <span className="admin-form-label__required">*</span>
          </label>
          <select
            name="level"
            className="admin-select"
            value={formData.level}
            onChange={handleChange}
          >
            <option value="N5">N5</option>
            <option value="N4">N4</option>
            <option value="N3">N3</option>
            <option value="N2">N2</option>
            <option value="N1">N1</option>
          </select>
          {errors.level && <span className="admin-form-error">{errors.level}</span>}
        </div>

        {/* Strokes */}
        <div className="admin-form-group">
          <label className="admin-form-label">
            Số nét <span className="admin-form-label__required">*</span>
          </label>
          <input
            type="number"
            name="strokes"
            min="1"
            className="admin-form-input"
            value={formData.strokes}
            onChange={handleChange}
          />
          {errors.strokes && <span className="admin-form-error">{errors.strokes}</span>}
        </div>

        {/* Radical */}
        <div className="admin-form-group">
          <label className="admin-form-label">Bộ thủ</label>
          <input
            type="text"
            name="radical"
            className="admin-form-input"
            value={formData.radical}
            onChange={handleChange}
            placeholder="Ví dụ: 子 (Tử)"
          />
        </div>

        {/* Status */}
        <div className="admin-form-group">
          <label className="admin-form-label">Trạng thái hiển thị</label>
          <div className="admin-form-radio-group">
            <label className="admin-form-radio">
              <input
                type="radio"
                name="status"
                value="active"
                checked={formData.status === 'active'}
                onChange={handleChange}
              />
              Đang hiển thị
            </label>
            <label className="admin-form-radio">
              <input
                type="radio"
                name="status"
                value="hidden"
                checked={formData.status === 'hidden'}
                onChange={handleChange}
              />
              Đã ẩn
            </label>
          </div>
        </div>

        {/* Suggested Vocabulary */}
        <div className="admin-form-group admin-form-group--full">
          <label className="admin-form-label">Từ vựng gợi ý</label>
          <textarea
            name="suggestedVocab"
            className="admin-form-textarea"
            value={formData.suggestedVocab}
            onChange={handleChange}
            placeholder="Ví dụ: 日本 (Nhật Bản) - にほん"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="admin-form-actions">
        <button
          type="button"
          className="admin-btn admin-btn--outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Hủy bỏ
        </button>
        <button
          type="submit"
          className="admin-btn admin-btn--primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Đang lưu...' : 'Lưu Kanji'}
        </button>
      </div>
    </form>
  );
}
