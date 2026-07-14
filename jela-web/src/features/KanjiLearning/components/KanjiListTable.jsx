import { useKanjiI18n } from '../hooks/useKanjiI18n';

const TableHeader = ({ messages }) => (
  <thead>
    <tr>
      <th>Kanji</th>
      <th>{messages.meaning}</th>
      <th>{messages.romaji}</th>
      <th></th>
    </tr>
  </thead>
);

export default function KanjiListTable({
  level,
  data,
  isLoading,
  isError,
  selectedKanjiId,
  onSelectKanji,
}) {
  const { messages, getMeaning } = useKanjiI18n();

  if (!level) {
    return (
      <section className="kanji-list-section">
        <div className="kanji-state-box"><strong>{messages.chooseLevel}</strong></div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="kanji-list-section">
        <h2 className="kanji-section-heading">{messages.listTitle(level)}</h2>
        <div className="kanji-list-table-wrapper">
          <table className="kanji-list-table">
            <TableHeader messages={messages} />
            <tbody>
              {Array.from({ length: 6 }).map((_, index) => (
                <tr key={index}>
                  <td><span className="kanji-skeleton" style={{ height: 32, width: 32 }} /></td>
                  <td><span className="kanji-skeleton" style={{ height: 14, width: '80%' }} /></td>
                  <td><span className="kanji-skeleton" style={{ height: 14, width: '60%' }} /></td>
                  <td><span className="kanji-skeleton" style={{ height: 28, width: 70 }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="kanji-list-section">
        <h2 className="kanji-section-heading">{messages.listTitle(level)}</h2>
        <div className="kanji-state-box"><strong>{messages.loadError}</strong></div>
      </section>
    );
  }

  const content = data?.content ?? [];
  if (content.length === 0) {
    return (
      <section className="kanji-list-section">
        <h2 className="kanji-section-heading">{messages.listTitle(level)}</h2>
        <div className="kanji-state-box">{messages.noKanjiData}</div>
      </section>
    );
  }

  return (
    <section className="kanji-list-section">
      <div className="kanji-list-section__title">
        <h2 className="kanji-section-heading">{messages.listTitle(level)}</h2>
        <small style={{ color: 'var(--color-on-surface-variant)', fontSize: 12 }}>
          {messages.totalKanji(data?.pageable?.totalElements ?? content.length)}
        </small>
      </div>

      <div className="kanji-list-table-wrapper">
        <table className="kanji-list-table">
          <TableHeader messages={messages} />
          <tbody>
            {content.map((kanji) => (
              <tr
                key={kanji.id}
                className={selectedKanjiId === kanji.id ? 'kanji-list-table__row--selected' : ''}
                onClick={() => onSelectKanji(kanji.id)}
              >
                <td className="kanji-list-table__char">{kanji.character}</td>
                <td className="kanji-list-table__meaning">{getMeaning(kanji)}</td>
                <td className="kanji-list-table__romaji">{kanji.romaji}</td>
                <td>
                  <button
                    type="button"
                    className="kanji-list-table__action-btn"
                    onClick={(event) => {
                      event.stopPropagation();
                      onSelectKanji(kanji.id);
                    }}
                  >
                    {messages.viewDetails}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
