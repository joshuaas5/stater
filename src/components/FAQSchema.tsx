import { Helmet } from 'react-helmet-async';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  faqs: FAQItem[];
  showVisual?: boolean;
}

const FAQSchema: React.FC<FAQSchemaProps> = ({ faqs, showVisual = true }) => {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>
      
      {showVisual && (
        <section className="mt-12 mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="text-2xl"></span> Perguntas Frequentes
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details 
                key={index} 
                className="bg-slate-800/50 border-2 border-white/10 rounded-xl overflow-hidden group"
              >
                <summary className="p-4 cursor-pointer font-medium text-white hover:bg-white/5 transition-colors flex items-center justify-between">
                  <span>{faq.question}</span>
                  <span className="text-white/40 group-open:rotate-180 transition-transform"></span>
                </summary>
                <div className="px-4 pb-4 text-white/70 border-t border-white/10 pt-4">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </section>
      )}
    </>
  );
};

export default FAQSchema;