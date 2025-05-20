import React, { useState } from 'react';
import { NewsItem } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Newspaper } from 'lucide-react';

interface NewsCardProps {
  item: NewsItem;
}

const NewsCard: React.FC<NewsCardProps> = ({ item }) => {
  const { title, link, pubDate, contentSnippet, sourceName, imageUrl } = item;
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const decodeHTMLEntities = (text: string | null | undefined): string => {
    if (!text) return '';
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  };

  const showImage = imageUrl && imageUrl.trim() !== '' && !imageError;

  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 bg-card text-card-foreground group border-2 border-border/40 hover:border-primary/60">
      {showImage ? (
        <div className="w-full h-40 overflow-hidden border-b border-border/30">
          <img 
            src={imageUrl} 
            alt={decodeHTMLEntities(title) || 'Imagem da notícia'} 
            className={`object-cover w-full h-full transition-transform duration-300 ease-in-out group-hover:scale-105 ${imageUrl && imageUrl.endsWith('.svg') ? 'object-contain' : 'object-cover'}`}
            onError={handleImageError}
          />
        </div>
      ) : (
        <div className="w-full h-40 flex items-center justify-center bg-muted/50 border-b border-border/30">
          <Newspaper size={48} className="text-muted-foreground/50" />
        </div>
      )}
      <CardHeader className="pt-3 pb-1.5 px-4">
        <CardTitle className="text-md font-semibold leading-snug line-clamp-2 hover:text-primary/90 transition-colors">
          {decodeHTMLEntities(title) || 'Título indisponível'}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow py-1 px-4">
        <p className="text-sm text-muted-foreground/90 line-clamp-3">
          {decodeHTMLEntities(contentSnippet) || 'Conteúdo indisponível.'}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between items-center text-xs pt-2 pb-3 px-4 border-t border-border/30">
        <span className="font-medium text-primary/80 hover:text-primary transition-colors cursor-default">{sourceName || 'Fonte'}</span>
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all duration-200"
            aria-label={`Ler mais sobre ${decodeHTMLEntities(title)}`}
          >
            <ExternalLink size={16} className="mr-1" />
            Ler mais
          </a>
        )}
      </CardFooter>
    </Card>
  );
};

export default NewsCard;
