import { useQuery } from '@tanstack/react-query';
import dictionaryApi from '../../../api/dictionaryApi';

export const DICTIONARY_LISTS_QUERY_KEY = ['dictionary-lists'];

export function useDictionaryLists() {
  const query = useQuery({
    queryKey: DICTIONARY_LISTS_QUERY_KEY,
    queryFn: dictionaryApi.getLists,
    staleTime: 60_000,
  });

  return {
    ...query,
    lists: Array.isArray(query.data) ? query.data : [],
  };
}
