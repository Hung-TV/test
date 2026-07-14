import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import kanjiApi from '../services/kanjiApi';
import { useKanjiI18n } from './useKanjiI18n';

// ── Query keys ────────────────────────────────────────────────────────────────
export const KANJI_LEVELS_KEY      = ['kanji', 'levels'];
export const KANJI_LIST_KEY        = (level, page) => ['kanji', 'list', level, page];
export const KANJI_SEARCH_KEY      = (kw) => ['kanji', 'search', kw];
export const KANJI_DETAIL_KEY      = (id) => ['kanji', 'detail', id];
export const KANJI_HISTORY_KEY     = (page) => ['kanji', 'history', page];
export const LEARNING_LISTS_KEY    = ['kanji', 'learningLists'];

// ── Hook: Cấp độ / levels ─────────────────────────────────────────────────────
export function useKanjiLevels() {
  return useQuery({
    queryKey: KANJI_LEVELS_KEY,
    queryFn: kanjiApi.getLevels,
    staleTime: 5 * 60_000,
  });
}

// ── Hook: Danh sách Kanji theo cấp độ ────────────────────────────────────────
export function useKanjiByLevel(level, page, size = 10) {
  return useQuery({
    queryKey: KANJI_LIST_KEY(level, page),
    queryFn: () => kanjiApi.getKanjiByLevel(level, page, size),
    enabled: Boolean(level),
    staleTime: 60_000,
    keepPreviousData: true,
  });
}

// ── Hook: Tìm kiếm (debounce 300ms) ─────────────────────────────────────────
import { useDebounce } from '../../dictionary/hooks/useDebounce';

export function useKanjiSearch(keyword) {
  const debounced = useDebounce(keyword, 300);
  const trimmed   = debounced.trim();

  const query = useQuery({
    queryKey: KANJI_SEARCH_KEY(trimmed),
    queryFn:  () => kanjiApi.searchKanji(trimmed),
    enabled:  trimmed.length > 0,
    staleTime: 30_000,
  });

  return {
    ...query,
    data: Array.isArray(query.data) ? query.data : [],
    isDebouncing: keyword !== debounced,
  };
}

// ── Hook: Chi tiết Kanji ──────────────────────────────────────────────────────
export function useKanjiDetail(id) {
  return useQuery({
    queryKey: KANJI_DETAIL_KEY(id),
    queryFn:  () => kanjiApi.getKanjiDetail(id),
    enabled:  Boolean(id),
    staleTime: 0,
    gcTime: 0,
  });
}

// ── Hook: Lịch sử tra cứu ────────────────────────────────────────────
export function useKanjiHistory(isAuthenticated, page = 0) {
  return useQuery({
    queryKey: KANJI_HISTORY_KEY(page),
    queryFn:  () => kanjiApi.getKanjiHistory(page),
    enabled:  isAuthenticated,
    staleTime: 0,
  });
}

// ── Hook: Danh sách học tập ──────────────────────────────────────────────────
export function useLearningLists(isAuthenticated) {
  return useQuery({
    queryKey: LEARNING_LISTS_KEY,
    queryFn:  kanjiApi.getLists,
    enabled:  isAuthenticated,
    staleTime: 60_000,
  });
}

// ── Hook: Thêm Kanji vào danh sách ──────────────────────────────────────────
export function useAddKanjiToList({ onSuccess, onClose }) {
  const queryClient = useQueryClient();
  const { messages } = useKanjiI18n();

  const addMutation = useMutation({
    mutationFn: ({ listId, kanjiId }) => kanjiApi.addKanji(listId, kanjiId),
    onSuccess: async () => {
      toast.success(messages.addSuccess);
      await queryClient.invalidateQueries({ queryKey: LEARNING_LISTS_KEY });
      await queryClient.invalidateQueries({ queryKey: ['my-decks'] });
      onSuccess?.();
      onClose?.();
    },
    onError: (err) => {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        toast.error(messages.signInRequired);
      } else if (status === 409) {
        toast.error(messages.alreadyInList);
      } else {
        toast.error(messages.addFailed);
      }
    },
  });

  const createAndAddMutation = useMutation({
    mutationFn: async ({ name, kanjiId }) => {
      const newList = await kanjiApi.createList(name);
      return kanjiApi.addKanji(newList.id ?? newList.listId, kanjiId);
    },
    onSuccess: async () => {
      toast.success(messages.createSuccess);
      await queryClient.invalidateQueries({ queryKey: LEARNING_LISTS_KEY });
      await queryClient.invalidateQueries({ queryKey: ['my-decks'] });
      onSuccess?.();
      onClose?.();
    },
    onError: (err) => {
      const errMsg = err.response?.data?.message || messages.createFailed;
      toast.error(errMsg);
    },
  });

  return { addMutation, createAndAddMutation };
}
