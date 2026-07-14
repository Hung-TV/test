import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import KanjiForm from '../../../components/admin/KanjiForm';
import { ArrowLeftIcon } from '../../../components/common/AppIcons';
import {
  getKanjiById,
  updateKanji,
} from '../../../services/admin/adminKanjiService';

// Chuyển model service sang model mà KanjiForm đang hiển thị.
const toFormData = (kanji) => ({
  kanji: kanji.character,
  meaning: kanji.meaning,
  onyomi: kanji.onyomi || '',
  kunyomi: kanji.kunyomi || '',
  level: kanji.jlptLevel,
  strokes: kanji.strokeCount,
  radical: kanji.radical || '',
  suggestedVocab: kanji.exampleJapanese || '',
  status: kanji.status.toLowerCase(),
});

// Chuyển ngược dữ liệu form về contract updateKanji.
const toKanjiPayload = (formData) => ({
  character: formData.kanji,
  meaning: formData.meaning,
  onyomi: formData.onyomi,
  kunyomi: formData.kunyomi,
  jlptLevel: formData.level,
  strokeCount: Number(formData.strokes),
  radical: formData.radical,
  exampleJapanese: formData.suggestedVocab || '',
  exampleVietnamese: formData.exampleVietnamese || '',
  mnemonic: formData.mnemonic || '',
  status: formData.status.toUpperCase(),
});

export default function KanjiEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Bỏ qua kết quả nếu admin rời trang hoặc chuyển sang id khác trước khi
    // getKanjiById hoàn tất.
    let isActive = true;

    const loadKanji = async () => {
      try {
        const data = await getKanjiById(id);
        if (!isActive) return;
        setInitialData(toFormData(data));
        setError('');
      } catch (loadError) {
        if (!isActive) return;
        setError(
          loadError.message ||
            'Không thể tải dữ liệu Kanji hoặc Kanji không tồn tại.',
        );
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadKanji();
    return () => {
      isActive = false;
    };
  }, [id]);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setError('');
    try {
      await updateKanji(id, toKanjiPayload(formData));
      toast.success('Cập nhật Kanji thành công.');
      navigate('/admin/kanji');
    } catch (submitError) {
      const message = submitError.message || 'Không thể cập nhật Kanji';
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/kanji');
  };

  if (isLoading) {
    return (
      <div
        role="status"
        style={{
          textAlign: 'center',
          padding: 48,
          color: 'var(--admin-color-on-surface-variant)',
        }}
      >
        Đang tải dữ liệu...
      </div>
    );
  }

  if (!initialData) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <h2 style={{ color: 'var(--admin-color-error)' }}>
          {error || 'Không tìm thấy Kanji'}
        </h2>
        <button
          type="button"
          className="admin-btn admin-btn--outline"
          onClick={handleCancel}
          style={{ marginTop: 16 }}
        >
          <ArrowLeftIcon size={16} /> Quay lại danh sách
        </button>
      </div>
    );
  }

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
          <h1>Chỉnh sửa Kanji</h1>
          <p>Cập nhật thông tin cho chữ &quot;{initialData.kanji}&quot;</p>
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
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
