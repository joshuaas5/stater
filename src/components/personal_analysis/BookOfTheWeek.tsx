import React, { useState } from 'react';
import { getCurrentBookOfTheWeek, Book } from '@/data/recommendedBooks';
import { BookOpen, ExternalLink, Star, Sparkles } from 'lucide-react';

const BookOfTheWeek: React.FC = () => {
  const book: Book = getCurrentBookOfTheWeek();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!book) {
    return <p className="text-white/60">Nenhum livro recomendado para esta semana.</p>;
  }

  return (
    <div 
      className="rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-1"
      style={{
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}
    >
      {/* Header */}
      <div 
        className="p-4 flex items-center gap-3"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.4), rgba(236, 72, 153, 0.2))',
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)'
          }}
        >
          <BookOpen className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Livro da Semana
            <Sparkles className="h-4 w-4 text-amber-400" />
          </h2>
          <p className="text-xs text-white/60">Recomendação para sua jornada</p>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-5">
        <div className="flex gap-4">
          {/* Book Cover */}
          <div className="relative group flex-shrink-0">
            <div 
              className="w-28 h-40 rounded-lg overflow-hidden transition-all duration-300 group-hover:scale-105"
              style={{
                boxShadow: '0 15px 30px -5px rgba(0, 0, 0, 0.4), 0 0 30px rgba(139, 92, 246, 0.2)'
              }}
            >
              {!imageLoaded && !imageError && (
                <div 
                  className="absolute inset-0 animate-pulse flex items-center justify-center"
                  style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                >
                  <BookOpen className="h-8 w-8 text-white/30" />
                </div>
              )}
              {book.coverImageUrl && !imageError ? (
                <img 
                  src={book.coverImageUrl}
                  alt={`Capa do livro ${book.title}`}
                  className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.2))' }}
                >
                  <BookOpen className="h-10 w-10 text-white/50" />
                </div>
              )}
            </div>
            {/* Glow effect */}
            <div 
              className="absolute -inset-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.2))',
                filter: 'blur(15px)'
              }}
            />
          </div>
          
          {/* Book Info */}
          <div className="flex-1 min-w-0 flex flex-col">
            <h3 className="text-white font-bold text-base leading-tight mb-1 line-clamp-2">
              {book.title}
            </h3>
            <p className="text-white/60 text-sm mb-2">por {book.author}</p>
            
            {/* Rating */}
            <div className="flex items-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i}
                  className={`h-3.5 w-3.5 ${i < 4 ? 'text-amber-400 fill-amber-400' : 'text-white/20'}`}
                />
              ))}
              <span className="text-xs text-white/50 ml-1 capitalize">{book.category}</span>
            </div>
            
            {book.description && (
              <p className="text-white/70 text-xs leading-relaxed line-clamp-3 flex-1">
                {book.description}
              </p>
            )}
          </div>
        </div>
        
        {/* Amazon Button */}
        <a
          href={book.amazonLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg block"
          style={{
            background: 'linear-gradient(135deg, #ff9900, #ff6600)',
            color: '#000',
            boxShadow: '0 4px 15px rgba(255, 153, 0, 0.3)'
          }}
        >
          <span>Ver na Amazon</span>
          <ExternalLink className="h-4 w-4" />
        </a>
        
        <p className="text-center text-white/40 text-[10px] mt-2">
          * Link de afiliado - ajuda a manter o app gratuito
        </p>
      </div>
    </div>
  );
};

export default BookOfTheWeek;
