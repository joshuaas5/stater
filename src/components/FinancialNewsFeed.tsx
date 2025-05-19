import React, { useState, useEffect } from 'react';

interface NewsItem {
  title: string;
  link: string;
  pubDate?: string;
  contentSnippet?: string;
  sourceName?: string;
  imageUrl?: string;
}

const SOURCES_CONFIG = {
  'pt-BR': [
    { key: 'investnews', displayName: 'InvestNews' },
    { key: 'infomoney', displayName: 'InfoMoney' },
    { key: 'cointelegraph-br', displayName: 'Cointelegraph Brasil' },
    { key: 'cnn-brasil', displayName: 'CNN Brasil' },
    { key: 'moneytimes', displayName: 'Money Times' },
  ],
  'en-US': [
    { key: 'cointelegraph-en', displayName: 'Cointelegraph' },
    { key: 'reuters-business', displayName: 'Reuters Business' },
    { key: 'bloomberg', displayName: 'Bloomberg Markets' },
    { key: 'wsj-markets', displayName: 'WSJ Markets' },
  ],
};

const FinancialNewsFeed: React.FC = () => {
  // Troque por sua lógica real de idioma
  const [currentLanguage, setCurrentLanguage] = useState<'pt-BR' | 'en-US'>('pt-BR');
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllNewsForLang = async () => {
      setLoading(true);
      setError(null);
      const newsFromAllSources: NewsItem[] = [];
      const sourcesForLang = SOURCES_CONFIG[currentLanguage];
      try {
        for (const source of sourcesForLang) {
          const response = await fetch(`/api/get-news?lang=${currentLanguage}&sourceKey=${source.key}`);
          if (!response.ok) {
            console.warn(`Falha ao buscar notícias de ${source.displayName}: ${response.statusText}`);
            continue;
          }
          const data = await response.json();
          if (data.items) {
            const itemsWithSource = data.items.map((item: NewsItem) => ({ ...item, sourceName: source.displayName }));
            newsFromAllSources.push(...itemsWithSource);
          }
        }
        newsFromAllSources.sort((a, b) => {
          const dateA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
          const dateB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
          return dateB - dateA;
        });
        setAllNews(newsFromAllSources.slice(0, 20));
      } catch (err) {
        console.error("Erro ao buscar todas as notícias:", err);
        setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido ao buscar notícias.');
      } finally {
        setLoading(false);
      }
    };
    fetchAllNewsForLang();
  }, [currentLanguage]);

  if (loading) return <p>Carregando notícias...</p>;
  if (error) return <p>Erro ao carregar notícias: {error}</p>;
  if (allNews.length === 0) return <p>Nenhuma notícia encontrada.</p>;

  return (
    <div>
      <h2>Últimas Notícias Financeiras</h2>
      <button onClick={() => setCurrentLanguage(currentLanguage === 'pt-BR' ? 'en-US' : 'pt-BR')}>
        {currentLanguage === 'pt-BR' ? 'Ver notícias em inglês' : 'Ver notícias em português'}
      </button>
      <ul>
        {allNews.map((item, index) => (
          <li key={index} style={{ marginBottom: '1em', borderBottom: '1px solid #eee', paddingBottom: '1em' }}>
            <a href={item.link} target="_blank" rel="noopener noreferrer">
              <strong>{item.title}</strong>
            </a>
            <div>
              <small>
                Fonte: {item.sourceName}
                {item.pubDate && ` - ${new Date(item.pubDate).toLocaleString(currentLanguage, { dateStyle: 'short', timeStyle: 'short' })}`}
              </small>
            </div>
            {item.contentSnippet && <p style={{ fontSize: '0.9em', color: '#555' }}>{item.contentSnippet}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FinancialNewsFeed;
