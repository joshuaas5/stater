import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Share2, ArrowRight, User } from 'lucide-react';
import SEO from '@/components/SEO';
import { AdBanner } from '@/components/AdBanner';

interface ArticleLayoutProps {
  title: string;
  description: string;
  canonical?: string;
  keywords?: string | string[];
  date?: string;
  publishedDate?: string;
  modifiedDate?: string;
  readTime?: string;
  author?: string;
  category?: string;
  children: React.ReactNode;
  relatedArticles?: { title: string; slug: string }[];
}

const ArticleLayout: React.FC<ArticleLayoutProps> = ({
  title,
  description,
  canonical,
  keywords,
  date,
  publishedDate,
  modifiedDate,
  readTime = "8 min",
  author = "Stater",
  category,
  children,
  relatedArticles = []
}) => {
  const location = useLocation();
  const finalCanonical = canonical || location.pathname;
  const keywordsString = Array.isArray(keywords) ? keywords.join(', ') : (keywords || '');

  const shareArticle = async () => {
    const url = "https://www.stater.app" + finalCanonical;
    if (navigator.share) {
      try {
        await navigator.share({ title, text: description, url });
      } catch (e) {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copiado!");
    }
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return "Fevereiro de 2026";
    if (dateStr.includes(' de ')) return dateStr;
    try {
      const d = new Date(dateStr + 'T00:00:00');
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const displayDate = formatDate(date || publishedDate || '');
  const isoPublished = publishedDate || '2026-02-01';
  const isoModified = modifiedDate || publishedDate || '2026-02-01';

  return (
    <>
      <SEO 
        title={title} 
        description={description} 
        canonical={finalCanonical} 
        keywords={keywordsString} 
        type="article"
        author={author}
        publishedTime={isoPublished}
        modifiedTime={isoModified}
        section={category}
      />
      <div className="min-h-screen bg-slate-950 text-white">
        <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img src="/stater-logo-96.webp" alt="Stater" className="w-8 h-8" />
              <span className="text-xl font-bold text-white uppercase" style={{ fontFamily: "'Fredoka One', sans-serif", textShadow: '#3B82F6 2px 2px 0px, #1D4ED8 4px 4px 0px' }}>Stater</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/blog" className="text-white/60 hover:text-white text-sm font-medium hidden sm:block">Blog</Link>
              <Link to="/ferramentas" className="text-white/60 hover:text-white text-sm font-medium hidden sm:block">Ferramentas</Link>
              <Link to="/login?view=register" className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition">
                Criar Conta
              </Link>
            </div>
          </div>
        </header>

        <main className="pt-8 pb-16 px-4">
          <article className="max-w-3xl mx-auto" itemScope itemType="https://schema.org/Article">
            {/* Breadcrumb Schema */}
            <nav className="text-sm text-white/40 mb-6" aria-label="Breadcrumb" itemScope itemType="https://schema.org/BreadcrumbList">
              <span itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                <Link to="/" itemProp="item" className="hover:text-white">
                  <span itemProp="name">Inicio</span>
                </Link>
                <meta itemProp="position" content="1" />
              </span>
              <span className="mx-2">/</span>
              <span itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                <Link to="/blog" itemProp="item" className="hover:text-white">
                  <span itemProp="name">Blog</span>
                </Link>
                <meta itemProp="position" content="2" />
              </span>
              {category && (
                <>
                  <span className="mx-2">/</span>
                  <span itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                    <span itemProp="name" className="text-white/60">{category}</span>
                    <meta itemProp="position" content="3" />
                  </span>
                </>
              )}
            </nav>

            <Link to="/blog" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Blog</span>
            </Link>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6 leading-tight" itemProp="headline">{title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/50 mb-8 pb-8 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <time itemProp="datePublished" dateTime={isoPublished}>{displayDate}</time>
              </div>
              <meta itemProp="dateModified" content={isoModified} />
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{readTime} de leitura</span>
              </div>
              {author && (
                <div className="flex items-center gap-2" itemProp="author" itemScope itemType="https://schema.org/Organization">
                  <User className="w-4 h-4" />
                  <span itemProp="name">{author}</span>
                </div>
              )}
              <button onClick={shareArticle} className="flex items-center gap-2 hover:text-white transition-colors ml-auto" aria-label="Compartilhar artigo">
                <Share2 className="w-4 h-4" />
                <span>Compartilhar</span>
              </button>
            </div>

            <AdBanner slot="4402468222" className="my-8" />

            <div className="prose prose-invert prose-lg max-w-none" itemProp="articleBody">
              {children}
            </div>

            {relatedArticles.length > 0 && (
              <section className="mt-16 pt-8 border-t border-white/10">
                <h2 className="text-2xl font-bold mb-6">Artigos Relacionados</h2>
                <div className="grid gap-4">
                  {relatedArticles.map((article, i) => (
                    <Link key={i} to={`/blog/${article.slug}`} className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group">
                      <span className="font-medium">{article.title}</span>
                      <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
                    </Link>
                  ))}
                </div>
              </section>
            )}

                        <AdBanner slot="4402468222" className="mt-12 mb-8" />

            {/* CTA para app */}
            <section className="mt-16 p-8 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-2 border-blue-400 rounded-2xl text-center">
              <h2 className="text-2xl font-bold mb-3">Coloque em pratica com o Stater!</h2>
              <p className="text-white/60 mb-6 max-w-md mx-auto">
                Use nosso app gratuito para controlar suas financas e aplicar o que aprendeu neste artigo.
              </p>
              <Link 
                to="/login?view=register"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold px-8 py-4 rounded-xl hover:opacity-90 transition"
              >
                Criar Conta Gratis
              </Link>
            </section>
          </article>
        </main>

        <footer className="border-t border-white/10 py-8 text-center text-white/40 text-sm">
          <p>2026 Stater. Todos os direitos reservados.</p>
        </footer>
      </div>
    </>
  );
};

export default ArticleLayout;