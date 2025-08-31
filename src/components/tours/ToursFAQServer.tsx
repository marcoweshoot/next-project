type FAQ = { id: string; question: string; answer: string };

export default function ToursFAQServer({ faqs }: { faqs: FAQ[] }) {
  if (!faqs?.length) return null;

  return (
    <section className="py-16 bg-muted">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            Domande Frequenti sui Viaggi Fotografici
          </h2>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.id}
                className="rounded-lg shadow-sm border border-border overflow-hidden bg-card text-card-foreground"
              >
                <summary
                  className="px-6 py-4 text-left cursor-pointer list-none hover:bg-muted transition-colors
                             focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                             focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <span className="text-lg font-semibold text-foreground pr-4">
                    {faq.question}
                  </span>
                </summary>
                <div className="px-6 pb-4">
                  <div
                    className="prose max-w-none leading-relaxed text-muted-foreground dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: faq.answer || '' }}
                  />
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
