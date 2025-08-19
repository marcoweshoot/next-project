import React from 'react';

interface TourDayContentProps {
  description?: string;
  /** Intestazione opzionale per il blocco */
  title?: string;
  /** livello heading del titolo (default 3 => <h3>) */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Se true, trasforma gli <h1–h6> nel rich text in <p><strong>…</strong></p> */
  degradeHeadings?: boolean;
}

function degradeHeadingsToParagraphs(html: string) {
  // Sostituisce qualsiasi <h1..h6> con <p><strong>…</strong></p>
  return html
    .replace(/<\s*h[1-6]\b[^>]*>/gi, '<p><strong>')
    .replace(/<\s*\/\s*h[1-6]\s*>/gi, '</strong></p>');
}

const TourDayContent: React.FC<TourDayContentProps> = ({
  description,
  title,
  headingLevel = 3,
  degradeHeadings = true,
}) => {
  if (!description || typeof description !== 'string') return null;

  const H = (`h${headingLevel}` as keyof JSX.IntrinsicElements);
  const safeHtml = degradeHeadings ? degradeHeadingsToParagraphs(description) : description;

  return (
    <section className="prose prose-lg text-gray-800 dark:text-gray-200 max-w-none leading-relaxed">
      {title &&
        React.createElement(
          H,
          { className: 'text-2xl font-semibold' },
          title
        )}
      <div dangerouslySetInnerHTML={{ __html: safeHtml }} />
    </section>
  );
};

export default TourDayContent;
