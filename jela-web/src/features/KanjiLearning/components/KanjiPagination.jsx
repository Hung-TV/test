/**
 * KanjiPagination — thin wrapper quanh shared Pagination.
 * Backend Kanji dùng 0-indexed nên isOneBased=false (mặc định).
 */
import Pagination from '../../../components/shared/Pagination';
import { useKanjiI18n } from '../hooks/useKanjiI18n';

export default function KanjiPagination({ pageable, onPageChange }) {
  const { messages } = useKanjiI18n();

  if (!pageable) return null;

  return (
    <Pagination
      currentPage={pageable.pageNumber ?? 0}
      totalPages={pageable.totalPages ?? 0}
      onPageChange={onPageChange}
      isOneBased={false}
      label={messages.pagination}
      goToLabel={messages.goToPage ?? 'Đến trang'}
    />
  );
}
