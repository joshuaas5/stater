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
    { key: 'infomoney', lang: 'pt-BR', displayName: 'InfoMoney' },
    { key: 'investnews', lang: 'pt-BR', displayName: 'InvestNews' },
    { key: 'moneytimes', lang: 'pt-BR', displayName: 'Money Times' },
    { key: 'cointelegraph-br', lang: 'pt-BR', displayName: 'Cointelegraph Brasil' },
    { key: 'cnn-brasil', lang: 'pt-BR', displayName: 'CNN Brasil' },
  ];

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      let allNews: NewsItem[] = [];

      try {
        // Criar um array de promessas para buscar todas as fontes em paralelo
        const fetchPromises = newsSources.map(async (source) => {
          try {
            const response = await fetch(`/api/get-news?sourceKey=${source.key}&lang=${source.lang}`);
            if (!response.ok) {
              console.warn(`Failed to fetch news from ${source.key}: ${response.status}`);
              return [];
            }
            const data = await response.json();
            if (data.items && Array.isArray(data.items)) {
              // Limitar a 3 itens por fonte para garantir diversidade
              return data.items.slice(0, 3).map((item: any) => ({
                ...item,
                sourceName: item.sourceName || source.displayName,
                sourceKey: source.key
              }));
            }
            return [];
          } catch (err) {
            console.error(`Error fetching news from source ${source.key}:`, err);
            return [];
          }
        });

        // Aguardar todas as promessas serem resolvidas
        const results = await Promise.all(fetchPromises);
        
        // Log para verificar quantos itens foram retornados por cada fonte
        console.log('[HotContent] Artigos recebidos por fonte (antes do processamento):');
        results.forEach((items, index) => {
          const source = newsSources[index];
          console.log(`[HotContent] ${source.displayName}: ${items.length} artigos`);
        });

        // Garantir diversidade: pegar até 3 notícias de cada fonte
        const newsPerSource: {[key: string]: NewsItem[]} = {};
        
        // Agrupar notícias por fonte
        results.forEach((items, index) => {
          const sourceKey = newsSources[index].key;
          newsPerSource[sourceKey] = items;
        });
        
        // Selecionar notícias de cada fonte de forma alternada
        let remainingNews = true;
        let currentIndex = 0;
        
        while (remainingNews && allNews.length < 15) {
          remainingNews = false;
          
          // Tentar pegar uma notícia de cada fonte em ordem
          for (const sourceKey of Object.keys(newsPerSource)) {
            const sourceNews = newsPerSource[sourceKey];
            if (sourceNews.length > currentIndex) {
              allNews.push(sourceNews[currentIndex]);
              remainingNews = true;
            }
          }
          
          currentIndex++;
        }

        console.log(`[HotContent] Total de artigos coletados antes da filtragem: ${allNews.length}`);

        // Filtrar notícias duplicadas e sem imagem
        const uniqueNews = Array.from(new Map(allNews.map(item => [item.link, item])).values());
        console.log(`[HotContent] Artigos após filtro de duplicatas (por link): ${uniqueNews.length}`);

        const validNews = uniqueNews.filter(item => item.imageUrl && item.imageUrl.trim() !== '');
        console.log(`[HotContent] Artigos após filtro de imageUrl: ${validNews.length}`);
        
        // Embaralhar as notícias para mais aleatoriedade
        const shuffledNews = [...validNews].sort(() => Math.random() - 0.5);
        
        console.log('HotContent: Number of valid news items:', shuffledNews.length);
        setNewsItems(shuffledNews);
      } catch (e) {
        console.error('Failed to fetch news overall:', e);
        setError('Falha ao carregar notícias. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <div className="space-y-6 p-1 md:p-2">
      <BookOfTheWeek />

      <div className="bg-card shadow-sm rounded-lg p-4 md:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-card-foreground">Notícias de Finanças</h2>
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
