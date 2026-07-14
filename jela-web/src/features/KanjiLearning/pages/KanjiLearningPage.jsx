import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

// ── Dictionary components tái sử dụng ─────────────────────────────────────
import HandwritingModal from '../../dictionary/components/HandwritingModal';

// ── Kanji components ───────────────────────────────────────────────────────
import KanjiSearchBar        from '../components/KanjiSearchBar';
import KanjiSearchDropdown   from '../components/KanjiSearchDropdown';
import KanjiLevelSection     from '../components/KanjiLevelSection';
import KanjiListTable        from '../components/KanjiListTable';
import KanjiPagination       from '../components/KanjiPagination';
import KanjiHistoryTable     from '../components/KanjiHistoryTable';
import KanjiDetailPanel      from '../components/KanjiDetailPanel';
import AddToLearningListModal from '../components/AddToLearningListModal';

// ── Shared components ──────────────────────────────────────────────────────
import FocusModeSession from '../../../components/shared/FocusStudy/FocusModeSession';

// ── Hooks ──────────────────────────────────────────────────────────────────
import { useAuth } from '../../../hooks/useAuth';
import { useKanjiI18n } from '../hooks/useKanjiI18n';
import {
  useKanjiLevels,
  useKanjiByLevel,
  useKanjiSearch,
  useKanjiDetail,
  useKanjiHistory,
  useLearningLists,
  useAddKanjiToList,
} from '../hooks/useKanjiLearning';
import kanjiApi from '../services/kanjiApi';

// ── Styles ─────────────────────────────────────────────────────────────────
import '../styles/kanji-learning.css';

const parseKanjiIdParam = (searchParams) => {
  const id = Number(searchParams.get('kanjiId'));
  return Number.isInteger(id) && id > 0 ? id : null;
};

export default function KanjiLearningPage() {
  const { isAuthenticated } = useAuth();
  const { messages } = useKanjiI18n();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialKanjiId = parseKanjiIdParam(searchParams);

  // ── UI state ─────────────────────────────────────────────────────────────
  const [selectedLevel,      setSelectedLevel]      = useState('N5');
  const [currentPage,        setCurrentPage]        = useState(0);
  const [historyPage,        setHistoryPage]        = useState(0);
  const [selectedKanjiId,    setSelectedKanjiId]    = useState(initialKanjiId);
  const [searchKeyword,      setSearchKeyword]      = useState('');
  const [isSuggestionOpen,   setIsSuggestionOpen]   = useState(false);
  const [isHandwritingOpen,  setIsHandwritingOpen]  = useState(false);
  const [isListModalOpen,    setIsListModalOpen]    = useState(false);
  const [isDetailOpen,       setIsDetailOpen]       = useState(Boolean(initialKanjiId));
  const [isFocusModeOpen,    setIsFocusModeOpen]    = useState(false);
  const [listModalResetKey,  setListModalResetKey]  = useState(0);

  // ── Data queries ──────────────────────────────────────────────────────────
  const {
    data: levels,
    isLoading: isLevelsLoading,
  } = useKanjiLevels();

  const {
    data: kanjiPage,
    isLoading: isKanjiListLoading,
    isError: isKanjiListError,
  } = useKanjiByLevel(selectedLevel, currentPage);

  const {
    data: searchResults,
    isLoading: isSearchLoading,
    isDebouncing,
  } = useKanjiSearch(searchKeyword);

  const {
    data: kanjiDetail,
    isLoading: isDetailLoading,
    isError: isDetailError,
    isSuccess: isDetailSuccess,
  } = useKanjiDetail(selectedKanjiId);

  const {
    data: history,
    isLoading: isHistoryLoading,
  } = useKanjiHistory(isAuthenticated, historyPage);

  const {
    data: learningLists,
    isLoading: isListsLoading,
  } = useLearningLists(isAuthenticated);

  useEffect(() => {
    if (isDetailSuccess && selectedKanjiId && isAuthenticated) {
      // Invalidate tất cả history queries (mọi page)
      queryClient.invalidateQueries({ queryKey: ['kanji', 'history'] });
    }
  }, [isDetailSuccess, selectedKanjiId, isAuthenticated, queryClient]);

  useEffect(() => {
    if (!initialKanjiId) return undefined;

    const timeoutId = window.setTimeout(() => {
      setSelectedKanjiId(initialKanjiId);
      setIsDetailOpen(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [initialKanjiId]);

  const { addMutation, createAndAddMutation } = useAddKanjiToList({
    onClose: () => {
      setIsListModalOpen(false);
      setSelectedKanjiId(null);
      setListModalResetKey((k) => k + 1);
    },
  });

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSelectLevel = useCallback((level) => {
    setSelectedLevel(level);
    setCurrentPage(0);
  }, []);

  // ── JLPT Level Start ─────────────────────────────────────────────────────
  const startLevelMutation = useMutation({
    mutationFn: (level) => kanjiApi.startJlptLevel(level),
    onSuccess: (data, level) => {
      const listId = data?.listId ?? data?.list_id;
      toast.success(messages.startLevelSuccess(level));
      // Invalidate levels query để listId được cập nhật
      queryClient.invalidateQueries({ queryKey: ['kanji', 'levels'] });
      queryClient.invalidateQueries({ queryKey: ['my-decks'] });
      // Navigate sang My Decks và tự mở popup học
      setTimeout(() => {
        navigate('/my-decks', {
          state: { autoStudyListId: listId, autoStudyTab: 'kanji' }
        });
      }, 800);
    },
    onError: () => {
      toast.error(messages.startLevelError);
    },
  });

  const handleStartLevel = useCallback((level) => {
    if (!isAuthenticated) {
      toast.error(messages.signInRequired);
      return;
    }
    startLevelMutation.mutate(level);
  }, [isAuthenticated, messages.signInRequired, startLevelMutation]);

  const handleStudyLevel = useCallback((level, listId) => {
    navigate('/my-decks', {
      state: { autoStudyListId: listId, autoStudyTab: 'kanji' }
    });
  }, [navigate]);

  const handleSelectKanji = useCallback((kanjiId) => {
    setSelectedKanjiId(kanjiId);
    setIsSuggestionOpen(false);
    setIsDetailOpen(true);
  }, []);

  const handleSearchChange = useCallback((value) => {
    setSearchKeyword(value);
    setIsSuggestionOpen(Boolean(value.trim()));
  }, []);

  const handleSelectSuggestion = useCallback((item) => {
    setSelectedKanjiId(item.id);
    setSearchKeyword(item.character);
    setIsSuggestionOpen(false);
    setIsDetailOpen(true);
  }, []);

  const handleHandwritingCandidate = useCallback((character) => {
    setSearchKeyword(character);
    setIsSuggestionOpen(Boolean(character.trim()));
    setIsHandwritingOpen(false);
  }, []);

  const handleSelectList = useCallback((listId) => {
    if (!selectedKanjiId) return;
    addMutation.mutate({ listId, kanjiId: selectedKanjiId });
  }, [addMutation, selectedKanjiId]);

  const handleCreateList = useCallback((name) => {
    if (!selectedKanjiId) return;
    createAndAddMutation.mutate({ name, kanjiId: selectedKanjiId });
  }, [createAndAddMutation, selectedKanjiId]);

  const isModalLoading =
    isListsLoading || addMutation.isPending || createAndAddMutation.isPending;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <main className="kanji-page">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="kanji-page__header">
        <div className="kanji-page__eyebrow">{messages.eyebrow}</div>
        <h1>{messages.pageTitle}</h1>
        <span>{messages.pageDescription}</span>
      </header>

      {/* ── Search area ─────────────────────────────────────────────────── */}
      <div className="kanji-search-area">
        <KanjiSearchBar
          value={searchKeyword}
          onChange={handleSearchChange}
          onFocus={() => { if (searchKeyword.trim()) setIsSuggestionOpen(true); }}
          onOpenHandwriting={() => setIsHandwritingOpen(true)}
        />
        <KanjiSearchDropdown
          isVisible={isSuggestionOpen && Boolean(searchKeyword.trim())}
          isLoading={isSearchLoading}
          isDebouncing={isDebouncing}
          results={searchResults}
          onSelect={handleSelectSuggestion}
        />
      </div>

      {/* ── Workspace ───────────────────────────────────────────────────── */}
      <div className="kanji-workspace">
        {/* Left panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, minWidth: 0 }}>
          {/* Lộ trình Kanji */}
          <KanjiLevelSection
            levels={Array.isArray(levels) ? levels : []}
            isLoading={isLevelsLoading}
            isStartingLevel={startLevelMutation.isPending}
            selectedLevel={selectedLevel}
            onSelectLevel={handleSelectLevel}
            onStartLevel={handleStartLevel}
            onStudyLevel={handleStudyLevel}
          />

          {/* Danh sách Kanji theo cấp độ */}
          <KanjiListTable
            level={selectedLevel}
            data={kanjiPage}
            isLoading={isKanjiListLoading}
            isError={isKanjiListError}
            selectedKanjiId={selectedKanjiId}
            onSelectKanji={handleSelectKanji}
          />

          <KanjiPagination
            pageable={kanjiPage?.pageable}
            onPageChange={setCurrentPage}
          />
        </div>

        {/* Right panel: Lịch sử tra cứu */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          <KanjiHistoryTable
            history={history}
            isLoading={isHistoryLoading}
            isAuthenticated={isAuthenticated}
            selectedKanjiId={selectedKanjiId}
            onSelectKanji={handleSelectKanji}
            onPageChange={setHistoryPage}
          />
        </div>
      </div>
      {/* ── Modals ──────────────────────────────────────────────────────── */}
      <KanjiDetailPanel
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedKanjiId(null);
        }}
        kanji={kanjiDetail}
        isLoading={isDetailLoading}
        isError={isDetailError && Boolean(selectedKanjiId)}
        onAddToList={() => {
          setIsDetailOpen(false); // Đóng panel chi tiết
          setIsListModalOpen(true); // Mở modal chọn list nhưng GIỮ selectedKanjiId
        }}
      />

      <AddToLearningListModal
        key={listModalResetKey}
        isOpen={isListModalOpen}
        onClose={() => {
          if (isModalLoading) return;
          setIsListModalOpen(false);
          setSelectedKanjiId(null); // Giải phóng selectedKanjiId khi đóng modal list
          setListModalResetKey((k) => k + 1);
        }}
        kanji={kanjiDetail}
        lists={Array.isArray(learningLists) ? learningLists : []}
        isAuthenticated={isAuthenticated}
        isLoading={isModalLoading}
        onSelectList={handleSelectList}
        onCreateList={handleCreateList}
      />

      {/* HandwritingModal — dùng lại hoàn toàn từ Dictionary */}
      <HandwritingModal
        isOpen={isHandwritingOpen}
        onClose={() => setIsHandwritingOpen(false)}
        onSelectCandidate={handleHandwritingCandidate}
        labels={messages.handwritingModal}
      />

      {/* ── Focus Mode Overlay ────────────────────────────────────────── */}
      {isFocusModeOpen && (
        <FocusModeSession
          kanjiList={kanjiPage?.content || []}
          onClose={() => setIsFocusModeOpen(false)}
        />
      )}
    </main>
  );
}
