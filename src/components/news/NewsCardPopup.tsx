import React from 'react';
import { NewsItem } from '@/types'; // Assumindo que NewsItem está em types
import { ExternalLink, ImageOff } from 'lucide-react';

interface NewsCardPopupProps {
  item: NewsItem;
  currentLang: 'pt-BR' | 'en-US';
}

const NewsCardPopup: React.FC<NewsCardPopupProps> = ({ item, currentLang }) => {
  const { title, link, imageUrl, sourceName, pubDate, contentSnippet } = item;

  const formattedDate = pubDate
    ? new Date(pubDate).toLocaleDateString(currentLang, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Data não disponível';

  // Limitar o contentSnippet para evitar cards muito longos
  const snippet = contentSnippet ? (contentSnippet.length > 100 ? contentSnippet.substring(0, 97) + '...' : contentSnippet) : '';

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 flex flex-col h-full hover:border-primary/40">
      <a href={link} target="_blank" rel="noopener noreferrer" className="block group relative">
        {imageUrl ? (
          <div className="w-full h-36 overflow-hidden">
            <img 
              src={imageUrl} 
              alt={title} 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden'); }}
            />
          </div>
        ) : (
          <div className="w-full h-36 bg-muted flex items-center justify-center">
            <ImageOff className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        {/* Placeholder caso a imagem principal falhe e não haja URL */}
        <div className="w-full h-36 bg-muted flex items-center justify-center hidden">
          <ImageOff className="w-12 h-12 text-muted-foreground" />
        </div>
        {/* Badge com o nome da fonte */}
        <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm text-xs font-medium py-1 px-2 rounded-full shadow-sm">
          {sourceName || 'Fonte'}
        </div>
      </a>
      <div className="p-3 flex flex-col flex-grow">
        <a href={link} target="_blank" rel="noopener noreferrer" className="block mb-2 group">
          <h3 className="text-sm font-semibold text-card-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2 leading-tight">
            {title}
          </h3>
        </a>
        {snippet && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-snug">
            {snippet}
          </p>
        )}
        <div className="mt-auto flex justify-between items-center">
          <p className="text-xs text-muted-foreground">{formattedDate}</p>
          <a 
            href={link} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-xs flex items-center text-primary hover:text-primary/80 font-medium"
          >
            Ler mais <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default NewsCardPopup;
