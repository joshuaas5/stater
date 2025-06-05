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

  try {
    const feedUrl = RSS_FEEDS[lang][sourceKey];
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
  } catch (err) {
    console.error('[get-news] Erro ao buscar feed:', err);
    res.status(500).json({ error: 'Erro ao buscar notícias.' });
  }
}
