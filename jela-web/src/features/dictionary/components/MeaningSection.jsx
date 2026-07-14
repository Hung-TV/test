import { BookOpen } from 'lucide-react';
import { useDictionaryI18n } from '../hooks/useDictionaryI18n';
import ExampleList from './ExampleList';

const POS_MAP = {
  'n': 'Danh từ',
  'suf': 'Hậu tố',
  'n-suf': 'Hậu tố danh từ',
  'pref': 'Tiền tố',
  'adj-i': 'Tính từ đuôi -i',
  'adj-na': 'Tính từ đuôi -na',
  'adj-no': 'Danh từ bổ ngữ (-no)',
  'adj-pn': 'Trạng tính từ',
  'adv': 'Trạng từ',
  'v1': 'Động từ nhóm 2 (Ichidan)',
  'vs': 'Động từ nhóm 3 (~suru)',
  'vk': 'Động từ nhóm 3 (kuru)',
  'vi': 'Tự động từ',
  'vt': 'Tha động từ',
  'conj': 'Liên từ',
  'int': 'Thán từ',
  'prt': 'Trợ từ',
  'ctr': 'Từ chỉ đơn vị (Đếm)',
  'exp': 'Cụm từ',
  'num': 'Số từ',
  'pn': 'Danh từ riêng'
};

const formatPos = (posStr) => {
  if (!posStr) return '';
  return posStr.split(/[\s,]+/).map(part => {
    const cleanPart = part.trim().toLowerCase();
    if (POS_MAP[cleanPart]) return POS_MAP[cleanPart];
    if (cleanPart.startsWith('v5')) return 'Động từ nhóm 1 (Godan)';
    return part;
  }).join(', ');
};

export default function MeaningSection({ meanings }) {
  const { messages, getGloss } = useDictionaryI18n();
  const safeMeanings = Array.isArray(meanings) ? meanings : [];

  return (
    <section className="word-section">
      <h3><BookOpen size={18} /> {messages.meaningsTitle}</h3>

      {safeMeanings.length === 0 ? (
        <p className="word-section__empty">{messages.noMeaningData}</p>
      ) : (
        <div className="meaning-list">
          {safeMeanings.map((meaning, index) => {
            const gloss = getGloss(meaning);
            return (
              <article
                key={meaning.meaningId ?? `meaning-${index}`}
                className="meaning-item"
              >
                <div className="meaning-item__heading">
                  <span>{index + 1}</span>
                  <div>
                    {meaning.pos && <small>{formatPos(meaning.pos)}</small>}
                    <strong>{gloss || messages.noMeaning}</strong>
                  </div>
                </div>

                {meaning.xref && (
                  <p className="meaning-item__xref">
                    <strong>{messages.reference}</strong> {meaning.xref}
                  </p>
                )}

                <ExampleList examples={meaning.example || meaning.examples} />
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
