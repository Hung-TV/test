import { useState } from 'react';
import { CloseIcon, DatabaseIcon } from '../common/AppIcons';
import { checkVocabularyExists } from '../../services/admin/adminVocabularyService';

const EMPTY_FORM_DATA = {
  word: '',
  kana: '',
  romaji: '',
  meaning: '',
  partOfSpeech: '',
  jlptLevel: '',
  topic: '',
  exampleJapanese: '',
  exampleVietnamese: '',
  status: 'ACTIVE',
};

const getFormVersion = (initialData) =>
  JSON.stringify(
    Object.keys(EMPTY_FORM_DATA).map((field) => initialData?.[field] ?? ''),
  );

/**
 * Form dùng chung cho create/edit và hoàn toàn không gọi API.
 * `key` của component con giúp reset form khi initialData thay đổi sau request,
 * không cần đồng bộ props vào state bằng effect.
 */
export default function VocabularyForm(props) {
  return (
    <VocabularyFormFields
      key={getFormVersion(props.initialData)}
      {...props}
    />
  );
}

function VocabularyFormFields({
  initialData = null,
  onSubmit,
  onCancel,
  submitLabel = 'Lưu thông tin',
  loading = false,
  submitting = false,
  isSubmitting: legacySubmitting = false,
}) {
  const isSubmitting = Boolean(loading || submitting || legacySubmitting);

  // Chỉ giữ field thuộc contract form, không đưa id/date metadata vào payload.
  const [formData, setFormData] = useState(() => ({
    ...EMPTY_FORM_DATA,
    ...Object.fromEntries(
      Object.keys(EMPTY_FORM_DATA).map((field) => [
        field,
        initialData?.[field] ?? EMPTY_FORM_DATA[field],
      ]),
    ),
  }));

  const [errors, setErrors] = useState({});
  const [existingVocabInfo, setExistingVocabInfo] = useState(null);

  const handleVocabCheck = async () => {
    const wordVal = formData.word.trim();
    const kanaVal = formData.kana.trim();
    console.log("Checking vocab duplicate for:", wordVal, "and", kanaVal);

    if (!wordVal || !kanaVal) {
      console.log("Skipping check, word or kana is empty.");
      setExistingVocabInfo(null);
      return;
    }

    if (initialData && initialData.word === wordVal && initialData.kana === kanaVal) {
      console.log("Skipping check, word and kana match initialData.");
      setExistingVocabInfo(null);
      return;
    }

    try {
      console.log("Calling checkVocabularyExists API...");
      const res = await checkVocabularyExists(wordVal, kanaVal);
      console.log("Duplicate check API response:", res);
      if (res && res.exists) {
        setExistingVocabInfo(res);
        setErrors(prev => ({
          ...prev,
          word: 'Cảnh báo: Từ vựng này đã tồn tại trên hệ thống!'
        }));
      } else {
        setExistingVocabInfo(null);
        if (errors.word && errors.word.includes('tồn tại')) {
          setErrors(prev => ({ ...prev, word: '' }));
        }
      }
    } catch (e) {
      console.error("Duplicate check API failed:", e);
    }
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Xóa lỗi khi người dùng sửa
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.word?.trim()) newErrors.word = 'Vui lòng nhập từ vựng';
    if (!formData.kana?.trim()) newErrors.kana = 'Vui lòng nhập cách đọc (Kana)';
    if (!formData.meaning?.trim()) newErrors.meaning = 'Vui lòng nhập nghĩa';
    // partOfSpeech is commented out in UI, so we bypass this check
    // if (!formData.partOfSpeech) newErrors.partOfSpeech = 'Vui lòng chọn loại từ';
    if (!formData.jlptLevel) newErrors.jlptLevel = 'Vui lòng chọn cấp độ JLPT';
    if (!formData.status) newErrors.status = 'Vui lòng chọn trạng thái';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="admin-form-container">
      <form onSubmit={handleSubmit} className="admin-form">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          
          <div className="admin-form-group">
            <label className="admin-form-label">Từ vựng (Kanji/Kana) <span style={{color: 'var(--admin-color-error)'}}>*</span></label>
            <input
              type="text"
              name="word"
              className={`admin-form-input ${errors.word ? 'admin-form-input--error' : ''}`}
              value={formData.word}
              onChange={handleChange}
              onBlur={handleVocabCheck}
              placeholder="VD: 学校"
              disabled={isSubmitting}
            />
            {errors.word && <span className="admin-form-error">{errors.word}</span>}
            {existingVocabInfo && (
              <div className="admin-form-warning-box" style={{
                marginTop: 6,
                padding: 10,
                borderLeft: '4px solid var(--admin-color-error, #ea4335)',
                backgroundColor: 'rgba(234, 67, 53, 0.08)',
                borderRadius: 4,
                fontSize: 13
              }}>
                <strong>Từ vựng đã tồn tại:</strong><br />
                - Từ vựng: <strong>{existingVocabInfo.word}</strong> ({existingVocabInfo.kana})<br />
                - Nghĩa: <strong>{existingVocabInfo.meaning}</strong><br />
                - Cấp độ: <span className="admin-badge admin-badge--info" style={{ display: 'inline-block', padding: '2px 6px', fontSize: 11 }}>{existingVocabInfo.jlpt}</span>
              </div>
            )}
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Hiragana <span style={{color: 'var(--admin-color-error)'}}>*</span></label>
            <input
              type="text"
              name="kana"
              className={`admin-form-input ${errors.kana ? 'admin-form-input--error' : ''}`}
              value={formData.kana}
              onChange={handleChange}
              onBlur={handleVocabCheck}
              placeholder="VD: がっこう"
              disabled={isSubmitting}
            />
            {errors.kana && <span className="admin-form-error">{errors.kana}</span>}
          </div>

          {/* <div className="admin-form-group">
            <label className="admin-form-label">Romaji</label>
            <input
              type="text"
              name="romaji"
              className="admin-form-input"
              value={formData.romaji}
              onChange={handleChange}
              placeholder="VD: gakkou"
              disabled={isSubmitting}
            />
          </div> */}

          <div className="admin-form-group">
            <label className="admin-form-label">Nghĩa <span style={{color: 'var(--admin-color-error)'}}>*</span></label>
            <input
              type="text"
              name="meaning"
              className={`admin-form-input ${errors.meaning ? 'admin-form-input--error' : ''}`}
              value={formData.meaning}
              onChange={handleChange}
              placeholder="VD: Trường học"
              disabled={isSubmitting}
            />
            {errors.meaning && <span className="admin-form-error">{errors.meaning}</span>}
          </div>

          {/* <div className="admin-form-group">
            <label className="admin-form-label">Loại từ <span style={{color: 'var(--admin-color-error)'}}>*</span></label>
            <select
              name="partOfSpeech"
              className={`admin-form-input ${errors.partOfSpeech ? 'admin-form-input--error' : ''}`}
              value={formData.partOfSpeech}
              onChange={handleChange}
              disabled={isSubmitting}
            >
              <option value="">Chọn loại từ...</option>
              <option value="Danh từ">Danh từ</option>
              <option value="Động từ">Động từ</option>
              <option value="Tính từ đuôi i">Tính từ đuôi i</option>
              <option value="Tính từ đuôi na">Tính từ đuôi na</option>
              <option value="Trạng từ">Trạng từ</option>
              <option value="Liên từ">Liên từ</option>
              <option value="Khác">Khác</option>
            </select>
            {errors.partOfSpeech && <span className="admin-form-error">{errors.partOfSpeech}</span>}
          </div> */}

          <div className="admin-form-group">
            <label className="admin-form-label">JLPT Level <span style={{color: 'var(--admin-color-error)'}}>*</span></label>
            <select
              name="jlptLevel"
              className={`admin-form-input ${errors.jlptLevel ? 'admin-form-input--error' : ''}`}
              value={formData.jlptLevel}
              onChange={handleChange}
              disabled={isSubmitting}
            >
              <option value="">Chọn cấp độ...</option>
              <option value="N5">N5</option>
              <option value="N4">N4</option>
              <option value="N3">N3</option>
              <option value="N2">N2</option>
              <option value="N1">N1</option>
            </select>
            {errors.jlptLevel && <span className="admin-form-error">{errors.jlptLevel}</span>}
          </div>


          <div className="admin-form-group">
            <label className="admin-form-label">Trạng thái <span style={{color: 'var(--admin-color-error)'}}>*</span></label>
            <select
              name="status"
              className={`admin-form-input ${errors.status ? 'admin-form-input--error' : ''}`}
              value={formData.status}
              onChange={handleChange}
              disabled={isSubmitting}
            >
              <option value="ACTIVE">Hoạt động (ACTIVE)</option>
              <option value="HIDDEN">Ẩn khỏi học viên (HIDDEN)</option>
            </select>
            {errors.status && <span className="admin-form-error">{errors.status}</span>}
          </div>

          <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="admin-form-label">Ví dụ tiếng Nhật</label>
            <textarea
              name="exampleJapanese"
              className="admin-form-input"
              value={formData.exampleJapanese}
              onChange={handleChange}
              placeholder="VD: 学校へ行きます。"
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="admin-form-label">Ví dụ tiếng Việt (Nghĩa của ví dụ)</label>
            <textarea
              name="exampleVietnamese"
              className="admin-form-input"
              value={formData.exampleVietnamese}
              onChange={handleChange}
              placeholder="VD: Tôi đi đến trường."
              rows={3}
              disabled={isSubmitting}
            />
          </div>

        </div>

        <div className="admin-form-actions">
          <button 
            type="button" 
            className="admin-btn admin-btn--outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <CloseIcon size={16} /> Hủy bỏ
          </button>
          <button 
            type="submit" 
            className="admin-btn admin-btn--primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang xử lý...' : <><DatabaseIcon size={16} /> {submitLabel}</>}
          </button>
        </div>
      </form>
    </div>
  );
}
