const Parser = require('rss-parser');
const parser = new Parser({
  customFields: {
    item: ['media:content', 'enclosure', 'content', 'contentSnippet']
  }
});

const RSS_FEEDS = {
  'pt-BR': {
    'investnews': 'https://investnews.com.br/feed/',
    'infomoney': 'https://www.infomoney.com.br/feed/',
    'cointelegraph-br': 'https://br.cointelegraph.com/rss',
    'cnn-brasil': 'https://www.cnnbrasil.com.br/feed/',
    'moneytimes': 'https://www.moneytimes.com.br/feed/'
  },
  'en-US': {
    'cointelegraph-en': 'https://cointelegraph.com/rss',
    'reuters-business': 'http://feeds.reuters.com/reuters/businessNews',
    'bloomberg': 'https://feeds.bloomberg.com/markets/news.rss',
    'wsj-markets': 'https://feeds.a.dj.com/rss/RSSMarketsMain.xml'
  }
};

function cleanText(html) {
  return html ? html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : '';
}

module.exports = async (req, res) => {
  const { lang = 'pt-BR', sourceKey } = req.query;

  if (!sourceKey || !RSS_FEEDS[lang] || !RSS_FEEDS[lang][sourceKey]) {
    return res.status(400).json({ error: 'Idioma ou fonte de notícias inválida/não especificada.' });
  }

  const feedUrl = RSS_FEEDS[lang][sourceKey];

  try {
    // Parse diretamente via parseURL
    const feed = await parser.parseURL(feedUrl);
    const items = feed.items.map(item => ({
      title: item.title || '',
      link: item.link || '',
      pubDate: item.pubDate,
      contentSnippet: cleanText(item.contentSnippet || item.content || ''),
      isoDate: item.isoDate,
      sourceName: feed.title || sourceKey,
      imageUrl: item.enclosure?.url || item["media:content"]?.url || undefined
    })).slice(0, 10);

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    return res.status(200).json({ items });
  } catch (error) {
    console.error(`Erro ao buscar feed de ${feedUrl}:`, error);
    if (error && error.stack) {
      console.error('Stack trace:', error.stack);
    }
    return res.status(500).json({ error: `Erro ao processar o feed RSS de ${sourceKey}. Detalhes: ${error.message}. Stack: ${error.stack}` });
  }
};
