type FAQ = { id: string; question: string; answer: string };

export default function ToursFAQServer({ faqs }: { faqs: FAQ[] }) {
  if (!faqs?.length) return null;

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Domande Frequenti sui Viaggi Fotografici
          </h2>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                <summary className="px-6 py-4 text-left cursor-pointer hover:bg-gray-50 transition-colors list-none">
                  <span className="text-lg font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </span>
                </summary>
                <div className="px-6 pb-4">
                  <div
                    className="text-gray-700 leading-relaxed prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: faq.answer }}
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
