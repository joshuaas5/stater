import React, { useEffect, useState } from 'react';
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

      <Card className="bg-card/80 backdrop-blur-sm shadow-xl border-border/30 max-w-full md:max-w-4xl mx-auto overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold text-card-foreground flex items-center">
            <span>News</span>
            <span className="ml-1 animate-pulse text-yellow-500">🔥</span>
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
