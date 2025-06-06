import Parser from 'rss-parser';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Define types for RSS_FEEDS keys
const RSS_FEEDS_CONFIG = {
  'pt-BR': {
    investnews: 'https://investnews.com.br/feed/',
    infomoney: 'https://www.infomoney.com.br/feed/',
    'cointelegraph-br': 'https://br.cointelegraph.com/rss',
    'cnn-brasil': 'https://www.cnnbrasil.com.br/feed/',
    moneytimes: 'https://www.moneytimes.com.br/feed/'
  },
  'en-US': {
    'cointelegraph-en': 'https://cointelegraph.com/rss',
    'reuters-business': 'https://feeds.reuters.com/reuters/businessNews',
    bloomberg: 'https://feeds.bloomberg.com/markets/news.rss',
    'wsj-markets': 'https://feeds.a.dj.com/rss/RSSMarketsMain.xml'
  }
} as const;

type LanguageCode = keyof typeof RSS_FEEDS_CONFIG;
type SourceKey<L extends LanguageCode> = keyof (typeof RSS_FEEDS_CONFIG)[L];

// Inicializa parser com campos adicionais
const parser = new Parser({
  customFields: {
    item: ['media:content', 'enclosure', 'content', 'contentSnippet']
  }
});

// Feed URLs (using the typed config)
const RSS_FEEDS = RSS_FEEDS_CONFIG;

// Remove tags e whitespace extras
function cleanText(html: string): string {
  return html ? html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : '';
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const langParam = req.query.lang;
  const sourceKeyParam = req.query.sourceKey;

  // Type assertion for lang after defaulting
  const lang: LanguageCode = Array.isArray(langParam) ? langParam[0] as LanguageCode : (langParam as LanguageCode || 'pt-BR');
  // Type assertion for sourceKey, will be validated
  const sourceKey: string | undefined = Array.isArray(sourceKeyParam) ? sourceKeyParam[0] : sourceKeyParam;


  // Validação de parâmetros
  if (!sourceKey || !(lang in RSS_FEEDS) || !(sourceKey in RSS_FEEDS[lang])) {
    const msg = `Parâmetros inválidos: lang=${lang}, sourceKey=${sourceKey}`;
    console.error('[get-news]', msg);
    return res.status(400).json({ error: msg });
  }

  try {
    const feedUrl = RSS_FEEDS[lang][sourceKey as SourceKey<typeof lang>];
    const feed = await parser.parseURL(feedUrl);
    const news = feed.items.map(item => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      content: cleanText(item.content || item.contentSnippet || ''),
      enclosure: item.enclosure,
      media: item['media:content']
    }));
    res.status(200).json({ news });
  } catch (error: unknown) {
        let errMessage = 'Erro desconhecido';
    if (error instanceof Error) {
      errMessage = error.message;
    }
    const currentFeedUrl = (lang in RSS_FEEDS && sourceKey && sourceKey in RSS_FEEDS[lang]) ? RSS_FEEDS[lang][sourceKey as SourceKey<typeof lang>] : 'URL desconhecida';
    const errorMessageToLog = `Erro ao buscar feed de ${sourceKey} (${currentFeedUrl}): ${errMessage}`;
    console.error('[get-news]', errorMessageToLog, error);
    res.status(500).json({ 
      error: 'Erro ao buscar notícias.', 
      source: sourceKey || 'desconhecida',
      feed: currentFeedUrl,
      details: errMessage
    });
  }
}
