import React, { useEffect, useState } from 'react';
import { NewsItem } from '@/types';
import NewsCard from '@/components/news/NewsCard';
import BookOfTheWeek from '@/components/news/BookOfTheWeek';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle, Globe, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NewsSource {
  key: string;
  lang: string;
  displayName?: string;
}

const HotContent: React.FC = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newsScope, setNewsScope] = useState<'national' | 'international'>('national');

  const nationalNewsSources: NewsSource[] = [
    { key: 'infomoney', lang: 'pt-BR' },
    { key: 'investnews', lang: 'pt-BR' },
    { key: 'moneytimes', lang: 'pt-BR' },
    { key: 'cointelegraph-br', lang: 'pt-BR' },
  ];

  const internationalNewsSources: NewsSource[] = [
    { key: 'reutersBusiness', lang: 'en', displayName: 'Reuters Business' },
    { key: 'bloomberg', lang: 'en', displayName: 'Bloomberg' },
    { key: 'wsjMarkets', lang: 'en', displayName: 'WSJ Markets' },
    { key: 'ft', lang: 'en', displayName: 'Financial Times' },
  ];

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      setNewsItems([]);
      let allNews: NewsItem[] = [];

      const currentSources: NewsSource[] = newsScope === 'national' ? nationalNewsSources : internationalNewsSources;

      try {
        const fetchPromises = currentSources.map(async (source) => {
          try {
            const response = await fetch(`/api/get-news?sourceKey=${source.key}&lang=${source.lang}`);
            if (!response.ok) {
              console.warn(`Failed to fetch news from ${source.key}: ${response.status}`);
              return [];
            }
            const data = await response.json();
            if (data.items && Array.isArray(data.items)) {
              return data.items.slice(0, 3).map((item: any) => ({
                ...item,
                sourceName: source.displayName || item.sourceName || source.key
              }));
            }
            return [];
          } catch (err) {
            console.error(`Error fetching news from source ${source.key}:`, err);
            return [];
          }
        });

        const results = await Promise.all(fetchPromises);
        results.forEach(newsFromSource => {
          allNews = [...allNews, ...newsFromSource];
        });

        const uniqueNews = Array.from(new Map(allNews.map(item => [item.link, item])).values());
        const validNews = uniqueNews.filter(item => item.imageUrl && item.imageUrl.trim() !== '');
        console.log('HotContent: Number of valid news items:', validNews.length);

        setNewsItems(validNews);
      } catch (e) {
        console.error('Failed to fetch news overall:', e);
        setError('Falha ao carregar notícias. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [newsScope]);

  return (
    <div className="space-y-6 p-1 md:p-2">
      <BookOfTheWeek />

      <div className="bg-card shadow-sm rounded-lg p-4 md:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-card-foreground">Notícias de Finanças</h2>
          <div className="flex space-x-2">
            <Button
              variant={newsScope === 'national' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setNewsScope('national')}
              className="transition-all duration-200 ease-in-out"
            >
              <MapPin size={16} className="mr-2" /> Nacionais
            </Button>
            <Button
              variant={newsScope === 'international' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setNewsScope('international')}
              className="transition-all duration-200 ease-in-out"
            >
              <Globe size={16} className="mr-2" /> Internacionais
            </Button>
          </div>
        </div>

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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-h-[70vh] overflow-y-auto p-1">
            {newsItems.map((item, index) => (
              <NewsCard key={`${item.link}-${index}`} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HotContent;
