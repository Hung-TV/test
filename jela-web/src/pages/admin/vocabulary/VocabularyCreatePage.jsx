import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import VocabularyForm from '../../../components/admin/VocabularyForm';
import { ArrowLeftIcon } from '../../../components/common/AppIcons';
import { createVocabulary } from '../../../services/admin/adminVocabularyService';

export default function VocabularyCreatePage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setError('');
    try {
      // Page chỉ điều phối submit; HTTP/mock/normalize đều nằm trong service.
      await createVocabulary(formData);
      toast.success('Tạo từ vựng thành công.');
      navigate('/admin/vocabulary');
    } catch (submitError) {
      const message = submitError.message || 'Không thể tạo từ vựng';
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/vocabulary');
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
            <ArrowLeftIcon size={16} /> Quay lại
          </button>
          <h1>Thêm Từ Vựng Mới</h1>
          <p>Điền thông tin bên dưới để thêm một từ vựng mới vào hệ thống.</p>
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
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        submitLabel="Tạo từ vựng"
        submitting={isSubmitting}
      />
    </div>
  );
}
