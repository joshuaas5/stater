import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  type?: string;
  image?: string;
  keywords?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  canonical,
  type = 'website',
  image = '/stater-og.png',
  keywords,
  author = 'Stater',
  publishedTime,
  modifiedTime,
  section
}) => {
  const fullTitle = title.includes('Stater') ? title : title + ' | Stater';
  const siteUrl = 'https://www.stater.app';
  const fullCanonical = canonical ? siteUrl + canonical : undefined;
  const fullImage = image.startsWith('http') ? image : siteUrl + image;

  // Schema.org JSON-LD para artigos
  const articleSchema = type === 'article' ? {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title.substring(0, 110),
    "description": description.substring(0, 200),
    "image": fullImage,
    "author": {
      "@type": "Organization",
      "name": author,
      "url": siteUrl
    },
    "publisher": {
      "@type": "Organization",
      "name": "Stater",
      "logo": {
        "@type": "ImageObject",
        "url": siteUrl + "/stater-logo-512.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": fullCanonical
    },
    ...(publishedTime && { "datePublished": publishedTime }),
    ...(modifiedTime && { "dateModified": modifiedTime }),
    ...(section && { "articleSection": section })
  } : null;

  // Schema.org para WebSite
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Stater",
    "url": siteUrl,
    "description": "Aplicativo gratuito de controle financeiro pessoal. Gerencie despesas, receitas e alcance seus objetivos financeiros.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": siteUrl + "/blog?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {fullCanonical && <link rel="canonical" href={fullCanonical} />}
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      {fullCanonical && <meta property="og:url" content={fullCanonical} />}
      <meta property="og:site_name" content="Stater" />
      <meta property="og:locale" content="pt_BR" />
      
      {/* Article specific */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && section && (
        <meta property="article:section" content={section} />
      )}
      {type === 'article' && (
        <meta property="article:author" content={author} />
      )}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:site" content="@staterapp" />
      
      {/* Robots */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      
      {/* Additional */}
      <meta name="author" content={author} />
      <meta name="theme-color" content="#0f172a" />
      <link rel="alternate" hrefLang="pt-BR" href={fullCanonical || siteUrl} />
      
      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
      {articleSchema && (
        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;