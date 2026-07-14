import DeckCard from './DeckCard';

/**
 * DeckListSection — render một section gồm tiêu đề + grid các DeckCard.
 */
export default function DeckListSection({ title, decks, onStudy, onViewDetails }) {
  if (!decks || decks.length === 0) return null;

  return (
    <section className="deck-section">
      <h2 className="deck-section__title">{title}</h2>
      <div className="deck-grid">
        {decks.map((deck) => (
          <DeckCard
            key={deck.id}
            deck={deck}
            onStudy={onStudy}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>
    </section>
  );
}
