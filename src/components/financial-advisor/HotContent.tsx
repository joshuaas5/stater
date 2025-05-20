import React, { useEffect, useState } from 'react';
import { NewsItem } from '@/types';
import BookOfTheWeek from '@/components/news/BookOfTheWeek';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertTriangle, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const HotContent: React.FC = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const newsSources = [
    { key: 'infomoney', lang: 'pt-BR', displayName: 'InfoMoney' }, 
    { key: 'investnews', lang: 'pt-BR', displayName: 'InvestNews' },
    { key: 'money_times', lang: 'pt-BR', displayName: 'Money Times' }, 
    { key: 'cointelegraph-br', lang: 'pt-BR', displayName: 'Cointelegraph Brasil' }, 
    { key: 'cnn-brasil', displayName: 'CNN Brasil', lang: 'pt-BR' } 
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

        // Filtra duplicados por link
        const uniqueNews = Array.from(new Map(allNews.map(item => [item.link, item])).values());
        console.log(`[HotContent] Artigos após filtro de duplicatas (por link): ${uniqueNews.length}`);

        // Não precisamos mais atribuir imagens padrão
        const validNews = uniqueNews;
        
        console.log(`[HotContent] Total de notícias após processamento: ${validNews.length}`);
        
        // Embaralha as notícias para mais aleatoriedade
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

  // Função para formatar a data
  const formatDate = (isoDate: string): string => {
    try {
      const date = new Date(isoDate);
      return new Intl.DateTimeFormat('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="space-y-6 p-1 md:p-2">
      <BookOfTheWeek />

      <Card className="bg-card/80 backdrop-blur-sm shadow-xl border-border/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold text-card-foreground flex items-center">
            <span>Notícias de Finanças</span>
          </CardTitle>
        </CardHeader>

        <CardContent>
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
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              {newsItems.map((item, index) => (
                <div 
                  key={`${item.link}-${index}`} 
                  className="p-4 bg-background/80 hover:bg-background/95 border border-border/30 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ease-in-out"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs text-muted-foreground">{item.sourceName}</span>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HotContent;
