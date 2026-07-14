import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import dictionaryApi from '../../../api/dictionaryApi';
import { useDebounce } from './useDebounce';
import { useDictionaryI18n } from './useDictionaryI18n';

export function useDictionarySearch(searchKey) {
  const { language, messages } = useDictionaryI18n();
  const debouncedSearchKey = useDebounce(searchKey);
  const normalizedSearchKey = debouncedSearchKey.trim();

  const query = useQuery({
    queryKey: ['dictionary', 'search', normalizedSearchKey, language],
    queryFn: () => dictionaryApi.search(normalizedSearchKey, language),
    enabled: normalizedSearchKey.length > 0,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!query.error) return;

    const backendMessage = query.error.response?.data?.message;
    toast.error(backendMessage || messages.searchFailed);
  }, [messages.searchFailed, query.error]);

  return {
    ...query,
    data: Array.isArray(query.data) ? query.data : [],
    debouncedSearchKey,
    isDebouncing: searchKey !== debouncedSearchKey,
  };
}
