import React, { useState } from 'react';
import { getCurrentBookOfTheWeek, Book } from '@/data/recommendedBooks';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, ExternalLink } from 'lucide-react';

const BookOfTheWeek: React.FC = () => {
  const book: Book = getCurrentBookOfTheWeek();
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  if (!book) {
    return <p>Nenhum livro recomendado para esta semana.</p>;
  }

  return (
    <Card className="shadow-lg bg-card text-card-foreground">
      <CardHeader className="pb-3">
        <div className="flex items-center mb-2">
          <BookOpen size={20} className="mr-2 text-primary" />
          <CardTitle className="text-lg font-semibold">Livro da Semana</CardTitle>
        </div>
        <CardDescription className="text-base font-medium text-primary">
          {book.title}
        </CardDescription>
        <p className="text-sm text-muted-foreground">por {book.author}</p>
      </CardHeader>
      <CardContent className="pb-4">
        {book.coverImageUrl && !imageError && (
          <div className="mb-4 overflow-hidden rounded-md aspect-[3/4] w-32 mx-auto">
            <img 
              src={book.coverImageUrl} 
              alt={`Capa do livro ${book.title}`} 
              className="object-contain w-full h-full"
              onError={handleImageError}
            />
          </div>
        )}
        {book.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
            {book.description}
          </p>
        )}
        <p className="text-xs text-muted-foreground italic capitalize">Categoria: {book.category}</p>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          <a href={book.amazonLink} target="_blank" rel="noopener noreferrer">
            Ver na Amazon <ExternalLink size={16} className="ml-2" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BookOfTheWeek;
