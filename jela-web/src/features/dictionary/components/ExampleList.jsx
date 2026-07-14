import { useDictionaryI18n } from '../hooks/useDictionaryI18n';

export default function ExampleList({ examples }) {
  const { getExampleSentence } = useDictionaryI18n();
  const safeExamples = Array.isArray(examples) ? examples : [];
  if (safeExamples.length === 0) return null;

  return (
    <div className="example-list">
      {safeExamples.map((example, index) => {
        const translatedSentence = getExampleSentence(example);
        return (
          <article
            key={example.exId ?? `${example.sentenceJP}-${index}`}
            className="example-item"
          >
            {example.sentenceJP && <strong>{example.sentenceJP}</strong>}
            {translatedSentence && <p>{translatedSentence}</p>}
            {example.exTest && (
              <small className="example-item__exercise">{example.exTest}</small>
            )}
          </article>
        );
      })}
    </div>
  );
}
