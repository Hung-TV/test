import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import dictionaryApi from '../../../api/dictionaryApi';
import DictionaryListModal from '../components/DictionaryListModal';
import DictionarySearchBar from '../components/DictionarySearchBar';
import EmptyWordState from '../components/EmptyWordState';
import HandwritingButton from '../components/HandwritingButton';
import HandwritingModal from '../components/HandwritingModal';
import HistoryPanel from '../components/HistoryPanel';
import SearchSuggestionList from '../components/SearchSuggestionList';
import WordDetailCard from '../components/WordDetailCard';
import {
  DICTIONARY_HISTORY_QUERY_KEY,
  useDictionaryHistory,
} from '../hooks/useDictionaryHistory';
import {
  DICTIONARY_LISTS_QUERY_KEY,
  useDictionaryLists,
} from '../hooks/useDictionaryLists';
import { useDictionarySearch } from '../hooks/useDictionarySearch';
import { useWordDetail } from '../hooks/useWordDetail';
import { useDictionaryI18n } from '../hooks/useDictionaryI18n';
import { isFavoriteDictionaryList } from '../constants/dictionaryTranslations';
import '../styles/dictionary.css';


const getWordIdFromSearchParams = (searchParams) => {
  const wordId = Number(searchParams.get('wordId'));
  return Number.isInteger(wordId) && wordId > 0 ? wordId : null;
};

const applyHandwritingCharacter = (currentValue, character, mode = 'replace') => (
  mode === 'append' ? `${currentValue}${character}` : character
);

export default function DictionaryPage() {
  const { messages } = useDictionaryI18n();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  // URL là nguồn dữ liệu chính cho từ đang xem, giúp reload và Back/Forward
  // vẫn khôi phục đúng chi tiết từ vựng.
  const selectedWordId = getWordIdFromSearchParams(searchParams);
  const [searchKey, setSearchKey] = useState('');
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const [isHandwritingOpen, setIsHandwritingOpen] = useState(false);
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [listModalResetKey, setListModalResetKey] = useState(0);
  const [historyPage, setHistoryPage] = useState(1); // Dictionary backend dùng 1-indexed
  const {
    data: suggestions,
    isFetching,
    isDebouncing,
  } = useDictionarySearch(searchKey);
  const { lists, isLoading: isListsLoading } = useDictionaryLists();
  const {
    historyData,
    isLoading: isHistoryLoading,
    pageable: historyPageable,
  } = useDictionaryHistory(historyPage);
  const {
    data: selectedWord,
    dataUpdatedAt: detailUpdatedAt,
    isLoading: isDetailLoading,
    isError: isDetailError,
  } = useWordDetail(selectedWordId);
  const addWordMutation = useMutation({
    mutationFn: dictionaryApi.addWordToList,
    onSuccess: async () => {
      toast.success(messages.addSuccess);
      setIsListModalOpen(false);
      await queryClient.invalidateQueries({
        queryKey: DICTIONARY_LISTS_QUERY_KEY,
      });
      await queryClient.invalidateQueries({
        queryKey: ['my-decks'],
      });
    },
    onError: (error) => {
      const status = error.response?.status;

      if (status === 401 || status === 403) {
        toast.error(messages.signInToSave);
      } else if (status === 409) {
        toast.error(messages.wordAlreadyInList);
      } else {
        toast.error(messages.addFailed);
      }
    },
  });
  const createListMutation = useMutation({
    mutationFn: dictionaryApi.addWordToNewList,
    onSuccess: async () => {
      toast.success(messages.createSuccess);
      setIsListModalOpen(false);
      setListModalResetKey((current) => current + 1);
      await queryClient.invalidateQueries({
        queryKey: DICTIONARY_LISTS_QUERY_KEY,
      });
      await queryClient.invalidateQueries({
        queryKey: ['my-decks'],
      });
    },
    onError: (error) => {
      const status = error.response?.status;

      if (status === 401 || status === 403) {
        toast.error(messages.signInToSave);
      } else {
        const errMsg = error.response?.data?.message || messages.createFailed;
        toast.error(errMsg);
      }
    },
  });
  const favoriteMutation = useMutation({
    mutationFn: async ({ wordId }) => {
      // Dùng cache hiện tại; nếu query chưa có dữ liệu thì fetchQuery sẽ lấy
      // danh sách trước khi quyết định add vào list cũ hay tạo list mới.
      const cachedLists = queryClient.getQueryData(
        DICTIONARY_LISTS_QUERY_KEY,
      );
      const availableLists = Array.isArray(cachedLists)
        ? cachedLists
        : await queryClient.fetchQuery({
            queryKey: DICTIONARY_LISTS_QUERY_KEY,
            queryFn: dictionaryApi.getLists,
          });
      const favoriteList = (Array.isArray(availableLists) ? availableLists : [])
        .find(isFavoriteDictionaryList);

      if (favoriteList) {
        return dictionaryApi.addWordToList({
          listId: favoriteList.id,
          wordId,
        });
      }

      return dictionaryApi.addWordToNewList({
        listName: messages.favoriteListName,
        wordId,
      });
    },
    onSuccess: async () => {
      toast.success(messages.favoriteSuccess);
      await queryClient.invalidateQueries({
        queryKey: DICTIONARY_LISTS_QUERY_KEY,
      });
      await queryClient.invalidateQueries({
        queryKey: ['my-decks'],
      });
    },
    onError: (error) => {
      const status = error.response?.status;

      if (status === 401 || status === 403) {
        toast.error(messages.signInToSave);
      } else if (status === 409) {
        toast.error(messages.favoriteDuplicate);
      } else {
        toast.error(messages.favoriteFailed);
      }
    },
  });

  useEffect(() => {
    if (!selectedWordId || !detailUpdatedAt) return;

    // Backend lưu lịch sử khi tải detail, nên refresh cache sau mỗi lần tải thành công.
    queryClient.invalidateQueries({
      queryKey: DICTIONARY_HISTORY_QUERY_KEY,
    });
  }, [detailUpdatedAt, queryClient, selectedWordId]);

  const selectWordById = (wordId) => {
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);
      nextParams.set('wordId', String(wordId));
      return nextParams;
    });
  };

  const handleSelectSuggestion = (word) => {
    selectWordById(word.id);
    setSearchKey(word.kanji || word.hiragana || '');
    setIsSuggestionOpen(false);
  };

  const handleSelectHistoryWord = (wordId) => {
    selectWordById(wordId);
    setIsSuggestionOpen(false);
  };

  const handleSearchChange = (value) => {
    setSearchKey(value);
    setIsSuggestionOpen(Boolean(value.trim()));
  };

  const handleSelectHandwritingCandidate = (character) => {
    // Giai đoạn hiện tại dùng replace mode. Khi cần ghép nhiều ký tự, chỉ đổi
    // mode thành "append" mà không phải sửa HandwritingModal hoặc search hook.
    setSearchKey((currentValue) => (
      applyHandwritingCharacter(currentValue, character, 'replace')
    ));
    setIsSuggestionOpen(Boolean(character.trim()));
    setIsHandwritingOpen(false);
  };

  const handleOpenListModal = () => {
    if (!selectedWordId) {
      toast.error(messages.selectBeforeAdd);
      return;
    }

    setIsListModalOpen(true);
  };

  const handleSelectList = (listId) => {
    if (!selectedWordId) {
      toast.error(messages.selectBeforeAdd);
      return;
    }

    addWordMutation.mutate({
      listId,
      wordId: selectedWordId,
    });
  };

  const handleCreateList = (listName) => {
    if (!selectedWordId) {
      toast.error(messages.selectBeforeAdd);
      return;
    }

    createListMutation.mutate({
      listName: listName.trim(),
      wordId: selectedWordId,
    });
  };

  const handleCloseListModal = () => {
    if (addWordMutation.isPending || createListMutation.isPending) return;
    setIsListModalOpen(false);
    setListModalResetKey((current) => current + 1);
  };

  const handleSaveFavorite = () => {
    if (!selectedWordId) {
      toast.error(messages.selectBeforeFavorite);
      return;
    }

    favoriteMutation.mutate({ wordId: selectedWordId });
  };

  return (
    <main className="dictionary-page">
      <header className="dictionary-page__header">
        <div className="dictionary-page__eyebrow">
          <p>{messages.eyebrow}</p>
        </div>
        <h1>{messages.pageTitle}</h1>
        <span>{messages.pageDescription}</span>
      </header>

      <div className="dictionary-search-area">
        <div className="dictionary-search-row">
          <div className="dictionary-search-field">
            <DictionarySearchBar
              value={searchKey}
              onChange={handleSearchChange}
              onFocus={() => {
                if (searchKey.trim()) setIsSuggestionOpen(true);
              }}
            />
            <SearchSuggestionList
              isLoading={isDebouncing || isFetching}
              isVisible={isSuggestionOpen && Boolean(searchKey.trim())}
              suggestions={suggestions}
              onSelect={handleSelectSuggestion}
            />
          </div>
          <HandwritingButton onClick={() => setIsHandwritingOpen(true)} />
        </div>
      </div>

      <div className="dictionary-workspace">
        <HistoryPanel
          historyData={historyData}
          isLoading={isHistoryLoading}
          lists={lists}
          onSelectWord={handleSelectHistoryWord}
          pageable={historyPageable}
          onPageChange={setHistoryPage}
        />

        <section className="dictionary-content">
          {selectedWordId && !isDetailError ? (
            <WordDetailCard
              word={selectedWord}
              isLoading={isDetailLoading}
              isSavingFavorite={favoriteMutation.isPending}
              onAddToDeck={handleOpenListModal}
              onSaveFavorite={handleSaveFavorite}
            />
          ) : (
            <EmptyWordState />
          )}
        </section>
      </div>

      <DictionaryListModal
        key={listModalResetKey}
        isOpen={isListModalOpen}
        onClose={handleCloseListModal}
        lists={lists}
        isLoading={
          isListsLoading ||
          addWordMutation.isPending ||
          createListMutation.isPending
        }
        onSelectList={handleSelectList}
        onCreateList={handleCreateList}
      />

      <HandwritingModal
        isOpen={isHandwritingOpen}
        onClose={() => setIsHandwritingOpen(false)}
        onSelectCandidate={handleSelectHandwritingCandidate}
        labels={messages.handwritingModal}
      />
    </main>
  );
}
