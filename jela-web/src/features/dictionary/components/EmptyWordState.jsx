import { BookOpen, Search } from 'lucide-react';
import { useDictionaryI18n } from '../hooks/useDictionaryI18n';

export default function EmptyWordState() {
  const { messages } = useDictionaryI18n();

  return (
    <section className="empty-word-state">
      <span><BookOpen size={32} /></span>
      <h2>{messages.emptyTitle}</h2>
      <p>{messages.emptyDescription}</p>
      <small><Search size={15} /> {messages.supportedSearch}</small>
    </section>
  );
}
