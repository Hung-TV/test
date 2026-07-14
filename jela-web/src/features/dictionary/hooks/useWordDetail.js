import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import dictionaryApi from '../../../api/dictionaryApi';
import { useDictionaryI18n } from './useDictionaryI18n';

export function useWordDetail(wordId) {
  const { language, messages } = useDictionaryI18n();
  const query = useQuery({
    queryKey: ['dictionary', 'detail', wordId, language],
    queryFn: () => dictionaryApi.getDetail(wordId, language),
    enabled: Boolean(wordId),
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    if (query.error) {
      toast.error(messages.detailFailed);
    }
  }, [messages.detailFailed, query.error]);

  return query;
}
