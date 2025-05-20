import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button'; 
import { Loader2, AlertTriangle, Globe, MapPin } from 'lucide-react'; 
import NewsCardPopup from '@/components/news/NewsCardPopup'; 
import { NewsItem } from '@/types'; 

const SOURCES_CONFIG = {
  'pt-BR': [
    { key: 'investnews', displayName: 'InvestNews', lang: 'pt-BR', logoUrl: 'https://media.investnews.com.br/uploads/2025/01/logo.svg' },
    { key: 'infomoney', displayName: 'InfoMoney', lang: 'pt-BR', logoUrl: 'https://www.infomoney.com.br/wp-content/uploads/2021/03/Site-thumb-de-materia.png?fit=1280%2C720&quality=50&strip=all' },
    { key: 'cointelegraph-br', displayName: 'Cointelegraph Brasil', lang: 'pt-BR', logoUrl: 'https://cointelegraph.com/assets/img/logo-blue.svg' }, 
    { key: 'cnn-brasil', displayName: 'CNN Brasil', lang: 'pt-BR', logoUrl: 'https://www.cnn.com/media/sites/cnn/cnn-logo.svg' }, 
    { key: 'money_times', displayName: 'Money Times', lang: 'pt-BR', logoUrl: 'https://fatorialinvest.com.br/wp-content/uploads/2023/03/Logo-Money-Times.png' } 
  ],
  'en-US': [
    { key: 'reuters', displayName: 'Reuters Business', lang: 'en-US', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e2/Reuters_logo.svg' }, 
    { key: 'bloomberg_markets', displayName: 'Bloomberg Markets', lang: 'en-US', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5d/New_Bloomberg_Logo.svg' },
    { key: 'wsj_markets', displayName: 'WSJ Markets', lang: 'en-US', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/WSJ_Logo.svg' },
    { key: 'cointelegraph', displayName: 'Cointelegraph', lang: 'en-US', logoUrl: 'https://cointelegraph.com/assets/img/logo-blue.svg' } 
  ]
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
                imageUrl: item.imageUrl, // Mantemos a imageUrl original aqui
                sourceKey: source.key, // Precisamos do sourceKey para o logo
                logoUrl: source.logoUrl // Adicionamos o logoUrl da fonte
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
          imageUrl: (item.imageUrl && item.imageUrl.trim() !== '') 
            ? item.imageUrl 
            : (item.logoUrl && item.logoUrl.trim() !== '') 
              ? item.logoUrl 
              : '/placeholder-news.jpg' // Fallback final para placeholder genérico
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
            className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-background transform hover:scale-105 active:scale-100 shadow hover:shadow-md ${currentScope === 'pt-BR' 
                ? 'bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 text-white ring-emerald-400'
                : 'bg-card text-card-foreground hover:bg-muted ring-transparent'}`}
          >
            <MapPin size={16} className={`mr-2`} /> 
            Nacionais
          </button>
          <button
            onClick={() => setCurrentScope('en-US')}
            className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-background transform hover:scale-105 active:scale-100 shadow hover:shadow-md ${currentScope === 'en-US' 
                ? 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white ring-indigo-400'
                : 'bg-card text-card-foreground hover:bg-muted ring-transparent'}`}
          >
            <Globe size={16} className={`mr-2`} /> 
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
