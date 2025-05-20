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
              // Limitar a 3 itens por fonte para garantir diversidade
              return data.items.slice(0, 3).map((item: any) => ({ 
                title: item.title,
                link: item.link,
                pubDate: item.pubDate,
                contentSnippet: item.contentSnippet,
                sourceName: source.displayName, 
                imageUrl: item.imageUrl,
                sourceKey: source.key
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
        
        // Garantir diversidade: organizar notícias por fonte
        const newsPerSource: {[key: string]: NewsItem[]} = {};
        
        // Agrupar notícias por fonte
        results.forEach((items, index) => {
          const sourceKey = sourcesForScope[index].key;
          newsPerSource[sourceKey] = items;
        });

        // Log de diagnóstico para verificar a contagem de notícias por fonte
        console.log('Artigos recebidos por fonte (antes do balanceamento):');
        sourcesForScope.forEach(source => {
          const count = newsPerSource[source.key] ? newsPerSource[source.key].length : 0;
          console.log(`${source.displayName}: ${count} artigos`);
        });
        
        // Selecionar notícias de forma equilibrada (uma de cada fonte por vez)
        const balancedNews: NewsItem[] = [];
        let remainingNews = true;
        let currentIndex = 0;
        console.log('[Balanceamento] Iniciando balanceamento. Máximo de 12 notícias.');
        
        while (remainingNews && balancedNews.length < 12) {
          remainingNews = false;
          console.log(`[Balanceamento] Início da iteração do while. currentIndex: ${currentIndex}, balancedNews.length: ${balancedNews.length}`);
          
          // Tentar pegar uma notícia de cada fonte em ordem
          for (const sourceKey of Object.keys(newsPerSource)) {
            const sourceNews = newsPerSource[sourceKey];
            console.log(`[Balanceamento] Verificando fonte: ${sourceKey}, notícias disponíveis nesta fonte: ${sourceNews.length}`);
            if (sourceNews.length > currentIndex) {
              balancedNews.push(sourceNews[currentIndex]);
              remainingNews = true;
              console.log(`[Balanceamento] Adicionada notícia de ${sourceKey} (índice ${currentIndex}). balancedNews.length: ${balancedNews.length}`);
              
              // Limitar a 12 notícias no total
              if (balancedNews.length >= 12) {
                console.log('[Balanceamento] Limite de 12 notícias atingido.');
                break;
              }
            }
          }
          
          currentIndex++;
          console.log(`[Balanceamento] Fim da iteração do while. Próximo currentIndex: ${currentIndex}, remainingNews: ${remainingNews}`);
        }
        console.log(`[Balanceamento] Finalizado. Total de notícias balanceadas: ${balancedNews.length}`);
        
        // Atribui imagem padrão para itens sem imagem
        const validNews = balancedNews.map(item => ({
          ...item,
          imageUrl: (item.imageUrl && item.imageUrl.trim() !== '') ? item.imageUrl : '/placeholder-news.jpg'
        }));
        
        console.log('FinancialNewsFeed: Number of news items after processing:', validNews.length);
        setAllNews(validNews.slice(0, 12)); // Garante que não mais que 12 são setadas
      } catch (err) {
        console.error("Erro ao buscar todas as notícias:", err);
        setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido ao buscar notícias.');
      } finally {
        setLoading(false);
      }
    };
    fetchAllNewsForScope();
  }, [currentScope]);

  useEffect(() => {
    console.log(`FinancialNewsFeed: allNews atualizado. Número de itens: ${allNews.length}`);
  }, [allNews]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-center py-4 bg-background z-20 mb-3">
        <div className="flex rounded-full p-1 bg-muted/50 shadow-md border border-border/20">
          <button
            onClick={() => setCurrentScope('pt-BR')}
            className={`flex items-center px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              currentScope === 'pt-BR' 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md transform scale-105' 
                : 'bg-transparent text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <MapPin size={16} className={`mr-2 ${currentScope === 'pt-BR' ? 'text-white' : 'text-muted-foreground'}`} /> 
            Nacionais
          </button>
          <button
            onClick={() => setCurrentScope('en-US')}
            className={`flex items-center px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              currentScope === 'en-US' 
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md transform scale-105' 
                : 'bg-transparent text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <Globe size={16} className={`mr-2 ${currentScope === 'en-US' ? 'text-white' : 'text-muted-foreground'}`} /> 
            Internacionais
          </button>
        </div>
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
