import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

import deckApi from './services/deckApi';
import dictionaryApi from '../../api/dictionaryApi';
import DeckListSection from './component/DeckListSection';
import CreateDeckModal from './component/CreateDeckModal';
import WordDetailCard from '../dictionary/components/WordDetailCard';
import { useMyDeckI18n } from './hooks/useMyDeckI18n';
import Pagination from '../../components/shared/Pagination';
import KanjiDetailPanel from '../KanjiLearning/components/KanjiDetailPanel';
import kanjiApi from '../KanjiLearning/services/kanjiApi';
import BatchSizeModal from './component/BatchSizeModal';
import KanjiReviewQuiz from '../../components/shared/FocusStudy/KanjiReviewQuiz';
import '../KanjiLearning/styles/kanji-learning.css';
import './styles/my-deck.css';

const MY_DECK_QUERY_KEY = ['my-decks'];

function DeckSkeletonGrid({ label }) {
  return (
    <div className="deck-grid" role="status" aria-label={label}>
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="deck-skeleton-card">
          <span className="deck-skeleton" style={{ height: 20, width: '70%' }} />
          <span className="deck-skeleton" style={{ height: 14, width: '40%' }} />
          <span className="deck-skeleton" style={{ height: 42, borderRadius: 10 }} />
        </div>
      ))}
    </div>
  );
}

function DeckDetailView({ deckId, deckTitle, deckType, onBack, onStudy }) {
  const [selectedWordId, setSelectedWordId] = useState(null);
  const [selectedKanjiId, setSelectedKanjiId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // 1. Fetch chi tiết bộ thẻ (phân trang dựa vào deckType)
  const {
    data: detailData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['deck-items', deckId, deckType, currentPage],
    queryFn: () => deckType === 'kanji'
      ? kanjiApi.getListDetails(deckId, currentPage, 10)
      : dictionaryApi.getListDetails(deckId, currentPage, 10),
    enabled: Boolean(deckId),
  });

  // 2. Fetch chi tiết của một từ cụ thể khi click (Lazy Loading)
  const { data: wordDetail, isLoading: isWordLoading } = useQuery({
    queryKey: ['deck-word-detail', selectedWordId],
    queryFn: () => dictionaryApi.getDetail(selectedWordId),
    enabled: Boolean(selectedWordId),
  });

  // 3. Fetch chi tiết của chữ Hán khi click (Lazy Loading)
  const { data: kanjiDetail, isLoading: isKanjiLoading, isError: isKanjiError } = useQuery({
    queryKey: ['deck-kanji-detail', selectedKanjiId],
    queryFn: () => kanjiApi.getKanjiDetail(selectedKanjiId),
    enabled: Boolean(selectedKanjiId),
  });

  if (isLoading) {
    return (
      <div className="deck-detail-container" style={{ padding: '24px 0' }}>
        <button type="button" className="deck-detail-back-btn" onClick={onBack}>
          ← Quay lại
        </button>
        <div className="deck-skeleton" style={{ height: 28, width: '40%', marginTop: 24, marginBottom: 8 }} />
        <div className="deck-skeleton" style={{ height: 16, width: '20%', marginBottom: 32 }} />
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="deck-skeleton"
            style={{ height: 56, borderRadius: 12, marginBottom: 12 }}
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="deck-error">
        <p>Không thể tải danh sách chi tiết. Vui lòng thử lại.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16 }}>
          <button type="button" className="deck-detail-back-btn" onClick={refetch}>
            Thử lại
          </button>
          <button type="button" className="deck-detail-back-btn" onClick={onBack}>
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const items = deckType === 'kanji' ? (detailData?.kanjis || []) : (detailData?.words || []);
  const totalRecords = detailData?.totalRecords ?? items.length;
  const totalPages = detailData?.totalPages ?? 1;

  return (
    <div className="deck-detail-container">
      <header className="deck-detail-header">
        <button type="button" className="deck-detail-back-btn" onClick={onBack}>
          ← Quay lại danh sách học
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h2 className="deck-detail-title" style={{ margin: '8px 0 0' }}>{deckTitle}</h2>
            <p className="deck-detail-subtitle" style={{ margin: '4px 0 0' }}>
              {totalRecords} {deckType === 'kanji' ? 'chữ Hán' : 'từ vựng'}
            </p>
          </div>
          {totalRecords > 0 && (
            <button
              type="button"
              className="deck-page__create-btn"
              onClick={() => {
                onStudy?.({
                  rawId: deckId,
                  type: deckType,
                  title: deckTitle,
                  totalWords: totalRecords,
                });
              }}
              style={{ margin: 0, padding: '10px 20px', borderRadius: '10px' }}
            >
              Học ngay
            </button>
          )}
        </div>
      </header>

      {items.length === 0 ? (
        <div className="deck-empty">
          {deckType === 'kanji'
            ? 'Danh sách này hiện chưa có chữ Hán nào. Hãy tra cứu Hán tự và thêm vào đây!'
            : 'Danh sách này hiện chưa có từ vựng nào. Hãy tra cứu từ điển và thêm từ vào đây!'}
        </div>
      ) : (
        <>
          <div className="deck-word-list">
            {deckType === 'kanji'
              ? (items.map((kanji) => (
                  <div
                    key={kanji.id}
                    className="deck-word-row"
                    onClick={() => setSelectedKanjiId(kanji.id)}
                  >
                    <div className="deck-word-row__text">
                      <span className="deck-word-row__kanji">{kanji.character}</span>
                    </div>
                    <span className="deck-word-row__action">Xem chi tiết →</span>
                  </div>
                )))
              : (items.map((word) => (
                  <div
                    key={word.id}
                    className="deck-word-row"
                    onClick={() => setSelectedWordId(word.id)}
                  >
                    <div className="deck-word-row__text">
                      <span className="deck-word-row__kanji">{word.kanji || word.hiragana}</span>
                      {word.kanji && word.hiragana && (
                        <span className="deck-word-row__hiragana">({word.hiragana})</span>
                      )}
                    </div>
                    <span className="deck-word-row__action">Xem chi tiết →</span>
                  </div>
                )))
            }
          </div>

          {totalPages > 1 && (
            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
                isOneBased={true}
                goToLabel="Trang"
              />
            </div>
          )}
        </>
      )}

      {selectedWordId && (
        <div className="deck-modal-backdrop" onClick={() => setSelectedWordId(null)}>
          <div className="deck-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="deck-modal-close-btn"
              onClick={() => setSelectedWordId(null)}
            >
              ×
            </button>
            <WordDetailCard
              word={wordDetail}
              isLoading={isWordLoading}
              onAddToDeck={() => {}}
              onSaveFavorite={() => {}}
            />
          </div>
        </div>
      )}

      <KanjiDetailPanel
        isOpen={Boolean(selectedKanjiId)}
        onClose={() => setSelectedKanjiId(null)}
        kanji={kanjiDetail}
        isLoading={isKanjiLoading}
        isError={isKanjiError}
        onAddToList={() => {}}
      />
    </div>
  );
}

export default function MyDecksHub() {
  const { language, messages, getDeckTitle } = useMyDeckI18n();
  const queryClient = useQueryClient();
  const location = useLocation();
  const autoStudyHandled = useRef(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dictionary'); // 'dictionary' | 'kanji'
  const [selectedDeckId, setSelectedDeckId] = useState(null);
  const [selectedDeckTitle, setSelectedDeckTitle] = useState('');
  const [selectedDeckType, setSelectedDeckType] = useState(null); // 'dictionary' | 'kanji'
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isStudySessionOpen, setIsStudySessionOpen] = useState(false);
  const [studyQuestions, setStudyQuestions] = useState([]);
  const [studyDeck, setStudyDeck] = useState(null);

  const queryKey = useMemo(() => [...MY_DECK_QUERY_KEY, language], [language]);
  const {
    data: decks = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => deckApi.getAll(language),
    staleTime: 60_000,
    select: (data) => (Array.isArray(data) ? data : []),
  });

  const createMutation = useMutation({
    mutationFn: ({ title, type }) => deckApi.create({ title, type }),
    onSuccess: (newDeck, variables) => {
      queryClient.setQueryData(queryKey, (currentDecks = []) => [
        newDeck,
        ...(Array.isArray(currentDecks) ? currentDecks : []),
      ]);
      setIsCreateModalOpen(false);
      toast.success(messages.createSuccess(variables.title));
    },
    onError: (err) => {
      const errMsg = err.response?.data?.message || messages.createFailed;
      toast.error(errMsg);
    },
  });

  // ── Auto-study khi navigate từ trang Kanji ──────────────────────────────────
  useEffect(() => {
    const { autoStudyListId, autoStudyTab } = location.state || {};
    if (!autoStudyListId || autoStudyHandled.current || isLoading || decks.length === 0) return;

    autoStudyHandled.current = true;

    const timeoutId = window.setTimeout(() => {
      if (autoStudyTab === 'kanji') {
        setActiveTab('kanji');
      }

      const targetDeck = decks.find(d => d.rawId === autoStudyListId || d.rawId === Number(autoStudyListId));
      if (targetDeck) {
        setStudyDeck(targetDeck);
        setIsBatchModalOpen(true);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [location.state, isLoading, decks]);

  // Cleanup location state sau khi xử lý để không trigger lại khi refresh
  useEffect(() => {
    if (location.state?.autoStudyListId) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Lọc bộ thẻ theo Tab đang active
  const filteredDecks = useMemo(
    () => decks.filter((deck) => deck.type === activeTab),
    [decks, activeTab],
  );

  // Hàm sắp xếp chung cho Kanji lists dựa trên tiến trình và deadline
  const sortKanjiDecks = useCallback((decksList, isJlpt, tieBreakerCompare) => {
    return [...decksList].sort((a, b) => {
      const getGroupRank = (deck) => {
        if (deck.dueCount > 0) return 1;
        if (!deck.completed) {
          if (isJlpt) return 2; // JLPT không phân tách nhóm 2A/2B vì kích thước từ vựng lệch lớn
          if ((deck.learningCount ?? 0) < (deck.totalWords ?? 0)) return 2;
          return 3; // learningCount == totalWords
        }
        return isJlpt ? 3 : 4; // completed
      };

      const rankA = getGroupRank(a);
      const rankB = getGroupRank(b);

      if (rankA !== rankB) {
        return rankA - rankB; // Thứ tự ưu tiên nhóm: 1 -> 2 -> 3 -> 4
      }

      // So sánh nội bộ trong cùng nhóm
      if (rankA === 1) {
        // Nhóm 1: Trễ deadline nhiều nhất lên trước
        if (a.dueCount !== b.dueCount) {
          return (b.dueCount ?? 0) - (a.dueCount ?? 0);
        }
      } else if (rankA === 2 && !isJlpt) {
        // Nhóm 2A (chỉ cho Custom): Đang học từ ít tới nhiều
        if (a.learningCount !== b.learningCount) {
          return (a.learningCount ?? 0) - (b.learningCount ?? 0);
        }
      }

      // Nhóm hoàn thành ( completed ) hoặc trùng các thông số ở trên
      const completedRank = isJlpt ? 3 : 4;
      if (rankA === completedRank && !isJlpt) {
        // Chỉ với Custom: Ngày đạt thành tựu mới nhất lên trước
        const dateA = new Date(a.updatedAt || 0).getTime();
        const dateB = new Date(b.updatedAt || 0).getTime();
        if (dateA !== dateB) {
          return dateB - dateA;
        }
      }

      // Trường hợp đồng hạng (Tie-breaker)
      return tieBreakerCompare(a, b);
    });
  }, []);

  // Sắp xếp danh sách JLPT theo tiến trình (Đồng hạng xếp theo N5 -> N1)
  const sortedJlptDecks = useMemo(() => {
    const jlptDecks = filteredDecks.filter(deck => deck.sourceType === 'JLPT_LEVEL');
    const order = { 'N5': 1, 'N4': 2, 'N3': 3, 'N2': 4, 'N1': 5 };
    
    const getLevel = (title) => {
      const match = title.match(/N[1-5]/);
      return match ? match[0] : '';
    };

    const jlptTieBreaker = (a, b) => {
      const lvlA = getLevel(a.title);
      const lvlB = getLevel(b.title);
      return (order[lvlA] || 99) - (order[lvlB] || 99);
    };

    return sortKanjiDecks(jlptDecks, true, jlptTieBreaker);
  }, [filteredDecks, sortKanjiDecks]);

  // Sắp xếp danh sách tự tạo
  const sortedCustomDecks = useMemo(() => {
    const customDecks = filteredDecks.filter(deck => deck.sourceType !== 'JLPT_LEVEL');
    
    const customTieBreaker = (a, b) => {
      const timeA = new Date(a.updatedAt || 0).getTime();
      const timeB = new Date(b.updatedAt || 0).getTime();
      if (timeA !== timeB) {
        return timeB - timeA;
      }
      return (b.rawId || 0) - (a.rawId || 0);
    };

    if (activeTab === 'dictionary') {
      return [...customDecks].sort((a, b) => (b.rawId || 0) - (a.rawId || 0));
    }
    return sortKanjiDecks(customDecks, false, customTieBreaker);
  }, [filteredDecks, activeTab, sortKanjiDecks]);

  const handleStudy = useCallback(
    (deck) => {
      setStudyDeck(deck);
      setIsBatchModalOpen(true);
    },
    [],
  );

  const handleStartKanjiStudy = async (batchSize) => {
    if (!studyDeck) return;
    const loadingToast = toast.loading(language === 'en' ? 'Loading study session...' : 'Đang tải lượt học...');
    try {
      const response = studyDeck.type === 'dictionary'
        ? await dictionaryApi.getLearnSession(studyDeck.rawId, batchSize)
        : await kanjiApi.getLearnSession(studyDeck.rawId, batchSize);

      if (response && Array.isArray(response.questions) && response.questions.length > 0) {
        setStudyQuestions(response.questions);
        setIsBatchModalOpen(false);
        setIsStudySessionOpen(true);
        toast.dismiss(loadingToast);
      } else {
        toast.error(
          studyDeck.type === 'dictionary'
            ? (language === 'en' ? 'No words to learn in this list.' : 'Không có từ vựng nào cần học trong danh sách này.')
            : (language === 'en' ? 'No Kanji to learn in this list.' : 'Không có chữ Hán nào cần học trong danh sách này.'),
          { id: loadingToast }
        );
      }
    } catch (error) {
      console.error('Failed to load learn session:', error);
      toast.error(
        language === 'en' ? 'Unable to start study session. Please try again.' : 'Không thể khởi tạo lượt học. Vui lòng thử lại.',
        { id: loadingToast }
      );
    }
  };

  const handleViewDetails = useCallback(
    (deck) => {
      setSelectedDeckId(deck.rawId);
      setSelectedDeckTitle(getDeckTitle(deck));
      setSelectedDeckType(deck.type);
    },
    [getDeckTitle],
  );

  // Local translations cho các Tab mới
  const vocabTabLabel = language === 'en' ? 'Vocabulary Lists' : 'Danh sách học từ vựng';
  const kanjiTabLabel = language === 'en' ? 'Kanji Lists' : 'Danh sách học Hán tự';

  return (
    <main className="deck-page">
      {!selectedDeckId && (
        <header className="deck-page__header">
          <h1 className="deck-page__title">{messages.pageTitle}</h1>
          <button
            type="button"
            className="deck-page__create-btn"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus size={18} strokeWidth={2.5} />
            {messages.createNewDeck}
          </button>
        </header>
      )}

      {selectedDeckId ? (
        <DeckDetailView
          key={`${selectedDeckType}-${selectedDeckId}`}
          deckId={selectedDeckId}
          deckTitle={selectedDeckTitle}
          deckType={selectedDeckType}
          onBack={() => setSelectedDeckId(null)}
          onStudy={handleStudy}
        />
      ) : (
        <>
          {/* Tabs Selector */}
          <div className="deck-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'dictionary'}
              className={`deck-tab${activeTab === 'dictionary' ? ' deck-tab--active' : ''}`}
              onClick={() => setActiveTab('dictionary')}
            >
              {vocabTabLabel}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'kanji'}
              className={`deck-tab${activeTab === 'kanji' ? ' deck-tab--active' : ''}`}
              onClick={() => setActiveTab('kanji')}
            >
              {kanjiTabLabel}
            </button>
          </div>

          {isLoading && (
            <>
              {activeTab === 'kanji' && (
                <section className="deck-section">
                  <h2 className="deck-section__title">{messages.jlptDecksSection}</h2>
                  <DeckSkeletonGrid label={messages.loadingDecks} />
                </section>
              )}
              <section className="deck-section">
                <h2 className="deck-section__title">{messages.customDecksSection}</h2>
                <DeckSkeletonGrid label={messages.loadingDecks} />
              </section>
            </>
          )}

          {!isLoading && isError && (
            <div className="deck-error" role="alert">
              <p>{messages.loadError}</p>
              <button type="button" className="deck-error__retry" onClick={() => refetch()}>
                {messages.retry}
              </button>
            </div>
          )}

          {!isLoading && !isError && (
            <>
              {activeTab === 'kanji' && (
                <DeckListSection
                  title={messages.jlptDecksSection}
                  decks={sortedJlptDecks}
                  onStudy={handleStudy}
                  onViewDetails={handleViewDetails}
                />
              )}

              <DeckListSection
                title={messages.customDecksSection}
                decks={sortedCustomDecks}
                onStudy={handleStudy}
                onViewDetails={handleViewDetails}
              />

              {filteredDecks.length === 0 && (
                <div className="deck-empty">
                  {activeTab === 'dictionary'
                    ? (language === 'en' ? 'No vocabulary learning lists found.' : 'Không tìm thấy danh sách học từ vựng nào.')
                    : (language === 'en' ? 'No Kanji learning lists found.' : 'Không tìm thấy danh sách học Hán tự nào.')}
                </div>
              )}
            </>
          )}
        </>
      )}

      {isCreateModalOpen && (
        <CreateDeckModal
          isLoading={createMutation.isPending}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={(title, type) => createMutation.mutate({ title, type })}
        />
      )}

      {isBatchModalOpen && studyDeck && (
        <BatchSizeModal
          isOpen={isBatchModalOpen}
          onClose={() => {
            setIsBatchModalOpen(false);
            setStudyDeck(null);
          }}
          onConfirm={handleStartKanjiStudy}
          totalWords={studyDeck.totalWords}
          deckType={studyDeck.type}
          listName={getDeckTitle(studyDeck)}
        />
      )}

      {isStudySessionOpen && studyQuestions.length > 0 && (
        <KanjiReviewQuiz
          listId={studyDeck?.rawId || studyDeck?.id}
          listName={studyDeck?.title || studyDeck?.listName || studyDeck?.name}
          preloadedQuestions={studyQuestions}
          deckType={studyDeck?.type}
          onClose={() => {
            setIsStudySessionOpen(false);
            setStudyQuestions([]);
            setStudyDeck(null);
            refetch();
          }}
        />
      )}
    </main>
  );
}
