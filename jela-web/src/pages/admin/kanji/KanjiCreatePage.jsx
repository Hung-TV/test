import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import KanjiForm from '../../../components/admin/KanjiForm';
import { ArrowLeftIcon } from '../../../components/common/AppIcons';
import { createKanji } from '../../../services/admin/adminKanjiService';

// KanjiForm dùng tên field ngắn cho UI; service dùng model chuẩn dự kiến của BE.
// Mapping tại page giữ component form tái sử dụng được và service không biết về UI.
const toKanjiPayload = (formData) => ({
  character: formData.kanji,
  meaning: formData.meaning,
  onyomi: formData.onyomi,
  kunyomi: formData.kunyomi,
  jlptLevel: formData.level,
  strokeCount: Number(formData.strokes),
  radical: formData.radical,
  exampleJapanese: formData.suggestedVocab || '',
  exampleVietnamese: '',
  mnemonic: '',
  status: formData.status.toUpperCase(),
});

export default function KanjiCreatePage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setError('');
    try {
      await createKanji(toKanjiPayload(formData));
      toast.success('Tạo Kanji thành công.');
      navigate('/admin/kanji');
    } catch (submitError) {
      const message = submitError.message || 'Không thể tạo Kanji';
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/kanji');
  };

  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-page-header__text">
          <button
            type="button"
            className="admin-btn admin-btn--outline"
            style={{ marginBottom: 16, padding: '6px 12px' }}
            onClick={handleCancel}
          >
            <ArrowLeftIcon size={16} /> Quay lại danh sách
          </button>
          <h1>Thêm mới Kanji</h1>
          <p>Tạo dữ liệu cho một chữ Kanji mới vào hệ thống</p>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          style={{
            padding: 12,
            marginBottom: 16,
            color: 'var(--admin-color-error)',
            background: 'var(--admin-color-error-container)',
            borderRadius: 8,
          }}
        >
          {error}
        </div>
      )}

      <KanjiForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
