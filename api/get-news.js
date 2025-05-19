import Parser from 'rss-parser';

// Inicializa parser com campos adicionais
const parser = new Parser({
  customFields: {
    item: ['media:content', 'enclosure', 'content', 'contentSnippet']
  }
});

// Feed URLs
const RSS_FEEDS = {
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
};

// Remove tags e whitespace extras
function cleanText(html) {
  return html ? html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : '';
}

export default async function handler(req, res) {
  const { lang = 'pt-BR', sourceKey } = req.query;

  // Validação de parâmetros
  if (!sourceKey || !RSS_FEEDS[lang] || !RSS_FEEDS[lang][sourceKey]) {
    const msg = `Parâmetros inválidos: lang=${lang}, sourceKey=${sourceKey}`;
    console.error('[get-news]', msg);
    return res.status(400).json({ error: msg });
  }

  const feedUrl = RSS_FEEDS[lang][sourceKey];
  console.log('[get-news] Lendo feed:', feedUrl);

  try {
    // Busca e parse do feed
    const feed = await parser.parseURL(feedUrl);
    if (!feed?.items || !Array.isArray(feed.items)) {
      throw new Error('Formato de RSS inválido: items não encontrado');
    }

    // Extrai primeiros 10 itens
    const items = feed.items
      .slice(0, 10)
      .map(item => ({
        title: item.title?.trim() || 'Sem título',
        link: item.link || '',
        pubDate: item.pubDate || item.isoDate || null,
        contentSnippet: cleanText(item.contentSnippet || item.content || item.description || ''),
        sourceName: feed.title || sourceKey,
        imageUrl: item.enclosure?.url || item['media:content']?.url || null
      }));

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    return res.status(200).json({ items });

  } catch (error) {
    console.error('[get-news] Erro ao buscar/parar RSS:', error);
    return res.status(500).json({ error: 'Erro ao buscar notícias.' });
  }
}
