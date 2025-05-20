import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button'; 
import { Loader2, AlertTriangle, Globe, MapPin } from 'lucide-react'; 
import NewsCardPopup from '@/components/news/NewsCardPopup'; 
import { NewsItem } from '@/types'; 

const SOURCES_CONFIG = {
  'pt-BR': [
    { key: 'investnews', displayName: 'InvestNews', lang: 'pt-BR' },
    { key: 'infomoney', displayName: 'InfoMoney', lang: 'pt-BR' },
    { key: 'cointelegraph-br', displayName: 'Cointelegraph Brasil', lang: 'pt-BR' },
    { key: 'cnn-brasil', displayName: 'CNN Brasil', lang: 'pt-BR' }, 
    { key: 'moneytimes', displayName: 'Money Times', lang: 'pt-BR' },
  ],
  'en-US': [
    { key: 'cointelegraph-en', displayName: 'Cointelegraph', lang: 'en-US' }, 
    { key: 'reutersBusiness', displayName: 'Reuters Business', lang: 'en-US' }, 
    { key: 'bloomberg', displayName: 'Bloomberg Markets', lang: 'en-US' }, 
    { key: 'wsjMarkets', displayName: 'WSJ Markets', lang: 'en-US' }, 
    // { key: 'ft', displayName: 'Financial Times', lang: 'en-US' }, 
  ],
};

type NewsScope = 'pt-BR' | 'en-US';

const FinancialNewsFeed: React.FC = () => {
  const [currentScope, setCurrentScope] = useState<NewsScope>('pt-BR');
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllNewsForScope = async () => {
      setLoading(true);
      setError(null);
      setAllNews([]); 
      const newsFromAllSources: NewsItem[] = [];
      const sourcesForScope = SOURCES_CONFIG[currentScope];
      
      try {
        // Criar um array de promessas para buscar todas as fontes em paralelo
        const fetchPromises = sourcesForScope.map(async (source) => {
          try {
            const response = await fetch(`/api/get-news?lang=${source.lang}&sourceKey=${source.key}`);
            if (!response.ok) {
              console.warn(`Falha ao buscar notícias de ${source.displayName}: ${response.statusText}`);
              return [];
            }
            const data = await response.json();
            if (data.items && Array.isArray(data.items)) {
              // Limitar a 4 itens por fonte para garantir diversidade
              return data.items.slice(0, 4).map((item: any) => ({ 
                title: item.title,
                link: item.link,
                pubDate: item.pubDate,
                contentSnippet: item.contentSnippet,
                sourceName: source.displayName, 
                imageUrl: item.imageUrl, 
              }));
            }
            return [];
          } catch (err) {
            console.error(`Erro ao buscar notícias de ${source.displayName}:`, err);
            return [];
          }
        });

        // Aguardar todas as promessas serem resolvidas
        const results = await Promise.all(fetchPromises);
        
        // Combinar todos os resultados
        results.forEach(items => {
          newsFromAllSources.push(...items);
        });
        
        // Ordenar por data (mais recentes primeiro)
        newsFromAllSources.sort((a, b) => {
          const dateA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
          const dateB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
          return dateB - dateA;
        });
        
        // Remover duplicatas e filtrar itens sem imagem
        const uniqueNews = Array.from(new Map(newsFromAllSources.map(item => [item.link, item])).values());
        const validNews = uniqueNews.filter(item => item.imageUrl && item.imageUrl.trim() !== '');
        console.log('FinancialNewsFeed: Number of valid news items for scope', currentScope, ':', validNews.length);

        // Limitar a 12 notícias no total
        setAllNews(validNews.slice(0, 12)); 
      } catch (err) {
        console.error("Erro ao buscar todas as notícias:", err);
        setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido ao buscar notícias.');
      } finally {
        setLoading(false);
      }
    };
    fetchAllNewsForScope();
  }, [currentScope]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-center space-x-4 py-3 bg-background z-20 border-b border-border/30 mb-2 shadow-sm">
        <Button
          variant={currentScope === 'pt-BR' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCurrentScope('pt-BR')}
          className="transition-all duration-200 ease-in-out px-4"
        >
          <MapPin size={16} className="mr-2" /> Nacionais
        </Button>
        <Button
          variant={currentScope === 'en-US' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCurrentScope('en-US')}
          className="transition-all duration-200 ease-in-out px-4"
        >
          <Globe size={16} className="mr-2" /> Internacionais
        </Button>
      </div>
      <div className="flex-grow overflow-y-auto pb-2 px-2">
        {loading && (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2 text-muted-foreground">Carregando notícias...</p>
          </div>
        )}
        {error && (
          <div className="flex flex-col items-center justify-center h-40 text-destructive">
            <AlertTriangle className="h-8 w-8 mb-2" />
            <p className="font-semibold">Erro ao carregar notícias</p>
            <p className="text-xs">{error}</p>
          </div>
        )}
        {!loading && !error && allNews.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mb-2" />
            <p>Nenhuma notícia encontrada para a seleção atual.</p>
          </div>
        )}

        {!loading && !error && allNews.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2">
            {allNews.map((item, index) => (
              <NewsCardPopup key={`${item.link}-${index}`} item={item} currentLang={currentScope} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialNewsFeed;
