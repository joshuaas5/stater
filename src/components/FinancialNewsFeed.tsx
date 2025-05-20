import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button'; 
import { Loader2, AlertTriangle, Globe, MapPin } from 'lucide-react'; 
import NewsCardPopup from '@/components/news/NewsCardPopup'; 
import { NewsItem } from '@/types'; 

interface SourceConfigItem {
  key: string;
  displayName: string;
  lang: string;
  logoUrl: string;
}

interface SourcesConfig {
  'pt-BR': SourceConfigItem[];
  'en-US': SourceConfigItem[];
}

type NewsScope = keyof SourcesConfig;

const SOURCES_CONFIG: SourcesConfig = {
  'pt-BR': [
    { key: 'investnews', displayName: 'InvestNews', lang: 'pt-BR', logoUrl: 'https://media.investnews.com.br/uploads/2025/01/logo.svg' },
    { key: 'infomoney', displayName: 'InfoMoney', lang: 'pt-BR', logoUrl: 'https://www.infomoney.com.br/wp-content/uploads/2021/03/Site-thumb-de-materia.png?fit=1280%2C720&quality=50&strip=all' },
    { key: 'cointelegraph-br', displayName: 'Cointelegraph Brasil', lang: 'pt-BR', logoUrl: 'https://cointelegraph.com/assets/img/logo-blue.svg' }, 
    { key: 'cnn-brasil', displayName: 'CNN Brasil', lang: 'pt-BR', logoUrl: 'https://www.cnnbrasil.com.br/wp-content/themes/cnn-brasil/assets/images/logo-cnn-brasil-new.png' }, 
    { key: 'money_times', displayName: 'Money Times', lang: 'pt-BR', logoUrl: 'https://fatorialinvest.com.br/wp-content/uploads/2023/03/Logo-Money-Times.png' } 
  ],
  'en-US': [
    { key: 'reuters_business', displayName: 'Reuters Business', lang: 'en-US', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e2/Reuters_logo.svg' }, 
    { key: 'bloomberg_markets', displayName: 'Bloomberg Markets', lang: 'en-US', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5d/New_Bloomberg_Logo.svg' }, 
    { key: 'wsj_markets', displayName: 'WSJ Markets', lang: 'en-US', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/WSJ_Logo.svg' }, 
    { key: 'cointelegraph_en', displayName: 'Cointelegraph', lang: 'en-US', logoUrl: 'https://cointelegraph.com/assets/img/logo-blue.svg' } 
  ]
};

const FinancialNewsFeed: React.FC = () => {
  const [currentScope, setCurrentScope] = useState<NewsScope>('pt-BR');
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async (scope: NewsScope) => {
    setLoading(true);
    setError(null);
    try {
      const sourcesConfigForScope = SOURCES_CONFIG[scope];
      if (!sourcesConfigForScope) {
        throw new Error(`Configuração de fontes não encontrada para o escopo: ${scope}`);
      }

      const sourcesToFetch = sourcesConfigForScope.map((s: SourceConfigItem) => s.key);
      
      const promises = sourcesToFetch.map(async (sourceKey: string) => {
        const sourceConfig = sourcesConfigForScope.find((s: SourceConfigItem) => s.key === sourceKey);
        if (!sourceConfig) {
          console.error(`Configuração não encontrada para sourceKey: ${sourceKey} no escopo ${scope}`);
          return []; // Retorna array vazio para não quebrar Promise.all
        }

        try {
          const response = await fetch(`/api/get-news?sourceKey=${sourceKey}&lang=${sourceConfig.lang}`);
          if (!response.ok) {
            let errorData;
            try {
              errorData = await response.json();
            } catch (e) {
              // Resposta não é JSON ou erro ao parsear
              errorData = { error: `Erro HTTP ${response.status} ${response.statusText}` };
            }
            const errorMessage = `Falha ao buscar notícias de ${sourceConfig.displayName}: ${errorData.error || `Status ${response.status}`}`;
            console.error(errorMessage, errorData);
            // Não joga erro aqui para Promise.all, mas loga e retorna vazio
            // setError(prevError => prevError ? `${prevError}\n${errorMessage}` : errorMessage); // Considere acumular erros de forma diferente se necessário
            return [];
          }
          const data = await response.json();
          // Assuming data.items is an array of objects that can be mapped to NewsItem
          // and data.feedTitle is available.
          if (data.items && Array.isArray(data.items)) {
            return data.items.map((item: any): NewsItem => ({
              ...item, // Spread original item properties
              id: item.id || item.link || Date.now().toString() + Math.random().toString(), // Ensure ID exists
              source: sourceKey, 
              feedTitle: data.feedTitle || sourceConfig.displayName,
              // Ensure other NewsItem properties are present or have defaults if needed
              title: item.title || 'Título indisponível',
              link: item.link || '#',
              isoDate: item.isoDate || new Date().toISOString(),
            }));
          }
          return [];
        } catch (err: any) {
          console.error(`Erro ao processar notícias da fonte ${sourceConfig.displayName}:`, err);
          // setError(prevError => prevError ? `${prevError}\nErro em ${sourceConfig.displayName}: ${err.message}` : `Erro em ${sourceConfig.displayName}: ${err.message}`);
          return []; // Retorna array vazio para esta fonte em caso de erro
        }
      });

      const results = await Promise.all(promises);
      const newsFromSources = results.flat().filter(item => item !== null) as NewsItem[]; // Filter out nulls if any and cast
      
      // Sort news by date
      const sortedNews = newsFromSources.sort((a, b) => {
        const dateA = a.isoDate ? new Date(a.isoDate).getTime() : 0; // Default to epoch if undefined for robust sorting
        const dateB = b.isoDate ? new Date(b.isoDate).getTime() : 0; // Default to epoch if undefined for robust sorting
        return dateB - dateA;
      });
      
      setAllNews(sortedNews);
      if (sortedNews.length === 0 && !error) {
        // Se nenhuma notícia foi carregada e não houve erro global, pode ser que todas as fontes falharam individualmente
        // ou não retornaram itens. Um erro mais específico poderia ser setado aqui.
        console.warn("Nenhuma notícia carregada, verifique os logs das fontes individuais.");
      }
    } catch (err: any) {
      console.error("Erro global ao buscar notícias:", err);
      setError(err.message || "Ocorreu um erro desconhecido ao buscar notícias.");
      setAllNews([]);
    } finally {
      setLoading(false);
    }
  }, []); // Removed 'error' from dependencies to prevent re-fetch loops if individual source errors update it

  useEffect(() => {
    fetchNews(currentScope);
  }, [currentScope, fetchNews]);

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
