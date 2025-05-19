import React, { useState } from 'react';
import { NewsItem } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';

interface NewsCardProps {
  item: NewsItem;
}

const NewsCard: React.FC<NewsCardProps> = ({ item }) => {
  const { title, link, pubDate, contentSnippet, sourceName, imageUrl } = item;
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  // Function to decode HTML entities
  const decodeHTMLEntities = (text: string | null | undefined): string => {
    if (!text) return '';
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  };

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
    <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card text-card-foreground group hover:border-primary/50 border-transparent border-2">
      {imageUrl && imageUrl.trim() !== '' && !imageError && (
        <div className="w-full h-40 overflow-hidden">
          <img 
            src={imageUrl} 
            alt={decodeHTMLEntities(title) || 'Imagem da notícia'} 
            className="object-cover w-full h-full transition-transform duration-300 ease-in-out group-hover:scale-105"
            onError={handleImageError}
          />
        </div>
      )}
      <CardHeader className={(imageUrl && imageUrl.trim() !== '' && !imageError) ? "pt-3 pb-1 px-4" : "pt-4 pb-1 px-4"}>
        <CardTitle className="text-base font-semibold leading-tight line-clamp-2">
          {decodeHTMLEntities(title) || 'Título indisponível'}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow pb-2 pt-1 px-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {decodeHTMLEntities(contentSnippet) || 'Conteúdo indisponível.'}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between items-center text-xs text-muted-foreground pt-2 pb-3 px-4 border-t border-border/50">
        <span className="text-muted-foreground/80">{sourceName || 'Fonte desconhecida'}</span>
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center p-2 rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors duration-200"
            aria-label={`Ler mais sobre ${decodeHTMLEntities(title)}`}
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
