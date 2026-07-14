import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import VocabularyForm from '../../../components/admin/VocabularyForm';
import { ArrowLeftIcon } from '../../../components/common/AppIcons';
import {
  getVocabularyById,
  updateVocabulary,
} from '../../../services/admin/adminVocabularyService';

export default function VocabularyEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [vocabulary, setVocabulary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;

    const loadVocabulary = async () => {
      setIsLoading(true);
      try {
        // Service normalize dữ liệu Dictionary/Admin API trước khi đưa vào form.
        const data = await getVocabularyById(id);
        if (!isActive) return;
        setVocabulary(data);
        setError('');
      } catch (loadError) {
        if (!isActive) return;
        setError(loadError.message || 'Không thể tải thông tin từ vựng');
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadVocabulary();
    return () => { isActive = false; };
  }, [id]);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setError('');
    try {
      await updateVocabulary(id, formData);
      toast.success('Cập nhật từ vựng thành công.');
      navigate('/admin/vocabulary');
    } catch (submitError) {
      const message = submitError.message || 'Không thể cập nhật từ vựng';
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/vocabulary');
  };

  if (isLoading) {
    return (
      <div role="status" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--admin-color-on-surface-variant)' }}>
        Đang tải thông tin từ vựng...
      </div>
    );
  }

  if (error && !vocabulary) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <h2 style={{ color: 'var(--admin-color-error)' }}>{error}</h2>
        <button type="button" className="admin-btn admin-btn--outline" onClick={handleCancel} style={{ marginTop: 16 }}>
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
            <ArrowLeftIcon size={16} /> Quay lại
          </button>
          <h1>Chỉnh sửa Từ Vựng</h1>
          <p>Cập nhật thông tin cho từ vựng <strong>{vocabulary?.word}</strong></p>
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

      <VocabularyForm
        initialData={vocabulary}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        submitLabel="Cập nhật từ vựng"
        submitting={isSubmitting}
      />
    </div>
  );
}
