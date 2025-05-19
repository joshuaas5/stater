import React from 'react';
import { NewsItem } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';

interface NewsCardProps {
  item: NewsItem;
}

const NewsCard: React.FC<NewsCardProps> = ({ item }) => {
  const { title, link, pubDate, contentSnippet, sourceName, imageUrl } = item;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Data não disponível';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateString; // Retorna a string original se houver erro
    }
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card text-card-foreground">
      {imageUrl && (
        <div className="w-full h-48 overflow-hidden">
          <img 
            src={imageUrl} 
            alt={title} 
            className="object-cover w-full h-full transition-transform duration-300 ease-in-out hover:scale-105"
          />
        </div>
      )}
      <CardHeader className={imageUrl ? "pt-4 pb-2" : "pt-6 pb-2"}>
        <CardTitle className="text-lg font-semibold leading-tight line-clamp-2">
          {title || 'Título indisponível'}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow pb-3 pt-1">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {contentSnippet || 'Conteúdo indisponível.'}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between items-center text-xs text-muted-foreground pt-2 pb-4 border-t border-border">
        <div className="flex flex-col">
          <span>{sourceName || 'Fonte desconhecida'}</span>
          <span>{formatDate(pubDate)}</span>
        </div>
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center p-2 rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors duration-200"
            aria-label={`Ler mais sobre ${title}`}
          >
            <ExternalLink size={18} className="mr-1" />
            Ler mais
          </a>
        )}
      </CardFooter>
    </Card>
  );
};

export default NewsCard;
