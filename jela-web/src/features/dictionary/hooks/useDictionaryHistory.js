import { useQuery } from '@tanstack/react-query';
import dictionaryApi from '../../../api/dictionaryApi';
import { useDictionaryI18n } from './useDictionaryI18n';

export const DICTIONARY_HISTORY_QUERY_KEY = ['dictionary-history'];

export function useDictionaryHistory(page = 1) {
  const { language } = useDictionaryI18n();
  const query = useQuery({
    queryKey: [...DICTIONARY_HISTORY_QUERY_KEY, page, language],
    queryFn: () => dictionaryApi.getHistory(page, language),
    // Spring Security có thể trả 401 hoặc 403 khi phiên không hợp lệ.
    // Không retry hai trạng thái này để tránh gửi request lịch sử lặp lại.
    retry: (failureCount, error) => {
      const status = error.response?.status;
      return status !== 401 && status !== 403 && failureCount < 1;
    },
  });

  const status = query.error?.response?.status;
  const isUnauthorized = status === 401 || status === 403;

  const rawData = query.data;
  const historyData = isUnauthorized
    ? null
    : (Array.isArray(rawData?.hisWordList) ? rawData.hisWordList : []);

  // Thông tin phân trang từ backend
  const totalPages = rawData?.totalPages ?? 1;
  const pageNumber = page; // backend dùng 1-indexed, giữ nguyên

  return {
    ...query,
    historyData,
    pageable: isUnauthorized ? null : { totalPages, pageNumber, isLast: page >= totalPages },
  };
}
