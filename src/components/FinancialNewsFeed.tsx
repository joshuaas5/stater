import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button'; 
import { Loader2, AlertTriangle, Globe, MapPin, ArrowRight, ExternalLink, Filter, Rss, Search, X } from 'lucide-react'; 
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NewsItem } from '@/types'; 

interface SourceConfigItem {
  key: string;
  displayName: string;
  lang?: string; // Tornando o campo lang opcional
}

interface SourcesConfig {
  'pt-BR': SourceConfigItem[];
  'en-US': SourceConfigItem[];
}

type NewsScope = keyof SourcesConfig;

// Fontes atualizadas conforme solicitado
const SOURCES_CONFIG: SourcesConfig = {
  'pt-BR': [
    { key: 'investnews', displayName: 'InvestNews', lang: 'pt-BR' },
    { key: 'infomoney', displayName: 'InfoMoney', lang: 'pt-BR' },
    { key: 'cointelegraph-br', displayName: 'Cointelegraph Brasil', lang: 'pt-BR' },
    { key: 'cnn-brasil', displayName: 'CNN Brasil', lang: 'pt-BR' },
    { key: 'moneytimes', displayName: 'MoneyTimes', lang: 'pt-BR' }
  ],
  'en-US': [
    { key: 'cointelegraph-en', displayName: 'Cointelegraph', lang: 'en-US' },
    { key: 'reuters-business', displayName: 'Reuters Business', lang: 'en-US' },
    { key: 'bloomberg', displayName: 'Bloomberg', lang: 'en-US' },
    { key: 'wsj-markets', displayName: 'WSJ Markets', lang: 'en-US' }
  ]
};

interface FinancialNewsFeedProps {
  hideHeader?: boolean;
}

const FinancialNewsFeed: React.FC<FinancialNewsFeedProps> = ({ hideHeader = false }) => {
  const [currentScope, setCurrentScope] = useState<NewsScope>('pt-BR');
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);
  const [visibleNewsCount, setVisibleNewsCount] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

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
          // Corrigindo chamada da API para enviar também o parâmetro 'lang' correto
          const response = await fetch(`/api/get-news?sourceKey=${sourceKey}&lang=${sourceConfig.lang || scope}`);
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
              sourceName: sourceConfig.displayName, // Usar sourceName em vez de source
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
      // Ordenar por data
      const sortedByDate = newsFromSources.sort((a, b) => {
        const dateA = a.isoDate ? new Date(a.isoDate).getTime() : 0; // Default to epoch if undefined for robust sorting
        const dateB = b.isoDate ? new Date(b.isoDate).getTime() : 0; // Default to epoch if undefined for robust sorting
        return dateB - dateA;
      });
      
      // Garantir que as notícias sejam misturadas (não aparecem do mesmo site uma abaixo da outra)
      const mixedNews: NewsItem[] = [];
      
      // Primeiro, agrupar notícias por fonte
      const newsBySource: Record<string, NewsItem[]> = {};
      sortedByDate.forEach(item => {
        // Usar sourceName como identificador da fonte
        const sourceKey = item.sourceName || '';
        if (!newsBySource[sourceKey]) {
          newsBySource[sourceKey] = [];
        }
        newsBySource[sourceKey].push(item);
      });
      
      // Pegar uma notícia de cada fonte em rodadas até acabarem todas
      let hasMoreNews = true;
      let roundIndex = 0;
      
      while (hasMoreNews) {
        hasMoreNews = false;
        
        // Para cada fonte, pegar a próxima notícia disponível
        Object.keys(newsBySource).forEach(sourceKey => {
          const sourceNews = newsBySource[sourceKey];
          if (sourceNews.length > roundIndex) {
            mixedNews.push(sourceNews[roundIndex]);
            hasMoreNews = true;
          }
        });
        
        roundIndex++;
      }
      
      const sortedNews = mixedNews;
      
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

  // Função para formatar a data
  const formatDate = (isoDate: string): string => {
    try {
      const date = new Date(isoDate);
      return new Intl.DateTimeFormat('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric'
      }).format(date);
    } catch (e) {
      return '';
    }
  };

  const getSourceDisplayName = (sourceKey: string): string => {
    const allSources = [...SOURCES_CONFIG['pt-BR'], ...SOURCES_CONFIG['en-US']];
    const source = allSources.find((s: SourceConfigItem) => s.key === sourceKey);
    return source ? source.displayName : sourceKey;
  };

  useEffect(() => {
    let tempNews = allNews;

    if (selectedSources.length > 0) {
      tempNews = tempNews.filter((news: NewsItem) => {
        // Usar sourceName ou id para identificar a fonte
        const sourceId = news.sourceName || '';
        return selectedSources.includes(sourceId);
      });
    }

    if (searchTerm) {
      tempNews = tempNews.filter((news: NewsItem) => 
        news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (news.contentSnippet && news.contentSnippet.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    setFilteredNews(tempNews);
    setVisibleNewsCount(10); 
  }, [selectedSources, searchTerm, allNews]);

  const handleSourceToggle = (sourceKey: string) => {
    setSelectedSources(prev =>
      prev.includes(sourceKey)
        ? prev.filter(s => s !== sourceKey)
        : [...prev, sourceKey]
    );
  };

  if (loading && allNews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Carregando notícias...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-2 md:p-4 pb-20">
      <Card className="mb-6 bg-card/80 backdrop-blur-sm shadow-xl border-border/30 max-w-full md:max-w-4xl mx-auto overflow-hidden">
        {!hideHeader && (
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Rss className="h-7 w-7 text-primary mr-3" />
                <CardTitle className="text-2xl font-bold text-foreground">Notícias do Mercado🔥</CardTitle>
              </div>
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
          </CardHeader>
        )}
        <CardContent>

          {loading && allNews.length > 0 && <div className="flex items-center justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />Carregando mais notícias...</div>}
          {error && <p className="text-red-500 text-center p-4 whitespace-pre-line">Erro ao carregar notícias: {error}</p>}

          <div className="space-y-4">
            {filteredNews.slice(0, visibleNewsCount).map((item: NewsItem, index: number) => (
              <div 
                key={`${item.id}-${index}-${item.link}`} 
                className="p-4 bg-background/80 hover:bg-background/95 border border-border/30 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ease-in-out"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs text-muted-foreground">{item.sourceName || 'Fonte desconhecida'}</span>
                  <span className="text-xs text-muted-foreground">{item.isoDate && formatDate(item.isoDate)}</span>
                </div>
                <a 
                  href={item.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-200 mb-2 line-clamp-2">{item.title}</h3>
                  
                  {item.contentSnippet && (
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-2">{item.contentSnippet}</p>
                  )}
                  
                  <div className="flex items-center text-primary text-xs font-medium">
                    <span>Ler artigo completo</span>
                    <ExternalLink size={12} className="ml-1" />
                  </div>
                </a>
              </div>
            ))}
          </div>
          
          {visibleNewsCount < filteredNews.length && (
            <div className="mt-8 text-center">
              <Button onClick={() => setVisibleNewsCount(prevCount => prevCount + 10)} variant="outline" className="bg-gradient-to-r from-primary/80 to-primary/70 text-primary-foreground hover:from-primary hover:to-primary/90 transition-all duration-300 ease-in-out shadow-md hover:shadow-lg transform hover:scale-105 rounded-full px-6 py-3">
                Carregar Mais Notícias
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}
          {filteredNews.length === 0 && !loading && (
             <div className="text-center py-10">
                <Rss size={48} className="mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-xl text-muted-foreground">Nenhuma notícia encontrada.</p>
                {!error && <p className="text-sm text-muted-foreground/80">Tente ajustar seus filtros ou o termo de busca.</p>}
                {error && <p className="text-sm text-muted-foreground/80">Verifique a mensagem de erro acima ou tente novamente mais tarde.</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialNewsFeed;
