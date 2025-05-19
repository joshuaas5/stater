import React, { useEffect, useState } from 'react';
import { NewsItem } from '@/types';
import NewsCard from '@/components/news/NewsCard';
import BookOfTheWeek from '@/components/news/BookOfTheWeek';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle } from 'lucide-react';

const HotContent: React.FC = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const newsSources = [
    { key: 'infomoney', lang: 'pt-BR' },
    { key: 'investnews', lang: 'pt-BR' },
    { key: 'moneytimes', lang: 'pt-BR' },
    { key: 'cointelegraph-br', lang: 'pt-BR' },
  ];

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      let allNews: NewsItem[] = [];
      try {
        const fetchPromises = newsSources.map(async (source) => {
          try {
            const response = await fetch(`/api/get-news?sourceKey=${source.key}&lang=${source.lang}`);
            if (!response.ok) {
              console.warn(`Failed to fetch news from ${source.key}: ${response.status}`);
              return []; // Return empty array on individual failure
            }
            const data = await response.json();
            if (data.items && Array.isArray(data.items)) {
              return data.items.slice(0, 3).map((item: any) => ({ 
                ...item, 
                sourceName: item.sourceName || source.key
              })); 
            }
            return []; // Return empty if no items
          } catch (err) {
            console.error(`Error fetching news from source ${source.key}:`, err);
            return []; // Return empty array on individual error
          }
        });

        const results = await Promise.all(fetchPromises);
        results.forEach(newsFromSource => {
          allNews = [...allNews, ...newsFromSource];
        });

        // Filter out items that don't have a seemingly valid imageUrl
        const validNews = allNews.filter(item => typeof item.imageUrl === 'string' && item.imageUrl.trim() !== '' && item.imageUrl.startsWith('http'));
        
        // Simple shuffle to mix news sources, and then take top 12
        validNews.sort(() => Math.random() - 0.5);
        setNewsItems(validNews.slice(0, 12)); 
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('Falha ao carregar notícias. Tente novamente mais tarde.');
      }
      setLoading(false);
    };

    fetchNews();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* News Section */}
        <div className="lg:col-span-8 xl:col-span-9">
          <h2 className="text-3xl font-bold mb-6 text-foreground">Últimas Notícias</h2>
          {loading && (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="ml-3 text-muted-foreground">Carregando notícias...</p>
            </div>
          )}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {!loading && !error && newsItems.length === 0 && (
            <p className="text-muted-foreground">Nenhuma notícia encontrada no momento.</p>
          )}
          {!loading && !error && newsItems.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {newsItems.map((item, index) => (
                <NewsCard key={`${item.link}-${index}`} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar with Book of the Week */}
        <aside className="lg:col-span-4 xl:col-span-3">
          <div className="sticky top-8">
            <BookOfTheWeek />
            {/* Poderíamos adicionar mais coisas aqui no futuro, como um 'Quote of the day' ou 'financial tip' */}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default HotContent;
