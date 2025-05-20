import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button'; 
import { Loader2, AlertTriangle, Globe, MapPin } from 'lucide-react'; 
import NewsCardPopup from '@/components/news/NewsCardPopup'; 
import { NewsItem } from '@/types'; 

const SOURCES_CONFIG = {
  'pt-BR': [
    { key: 'investnews', displayName: 'InvestNews', lang: 'pt-BR', logoUrl: 'https://media.investnews.com.br/uploads/2025/01/logo.svg' },
    { key: 'infomoney', displayName: 'InfoMoney', lang: 'pt-BR', logoUrl: 'https://www.infomoney.com.br/wp-content/uploads/2021/03/Site-thumb-de-materia.png?fit=1280%2C720&quality=50&strip=all' },
    { key: 'cointelegraph_br', displayName: 'Cointelegraph Brasil', lang: 'pt-BR', logoUrl: 'https://cointelegraph.com/assets/img/logo-blue.svg' },
    { key: 'cnn_brasil', displayName: 'CNN Brasil', lang: 'pt-BR', logoUrl: 'https://www.cnn.com/media/sites/cnn/cnn-logo.svg' }, // Placeholder global
    { key: 'money_times', displayName: 'Money Times', lang: 'pt-BR', logoUrl: 'https://fatorialinvest.com.br/wp-content/uploads/2023/03/Logo-Money-Times.png' }, // TODO: Save locally if desired
    { key: 'reuters_pt', displayName: 'Reuters PT', lang: 'pt-BR', logoUrl: 'data:image/png;base64,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' }
  ],
  'en-US': [
    { key: 'reuters_business', displayName: 'Reuters Business', lang: 'en-US', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e2/Reuters_logo.svg' },
    { key: 'bloomberg_markets', displayName: 'Bloomberg Markets', lang: 'en-US', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5d/New_Bloomberg_Logo.svg' },
    { key: 'wsj_markets', displayName: 'WSJ Markets', lang: 'en-US', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/WSJ_Logo.svg' },
    { key: 'cointelegraph_en', displayName: 'Cointelegraph', lang: 'en-US', logoUrl: 'https://cointelegraph.com/assets/img/logo-blue.svg' }
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
