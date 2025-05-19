const Parser = require('rss-parser');
const https = require('https');

const parser = new Parser({
  customFields: {
    item: ['media:content', 'enclosure', 'content', 'contentSnippet']
  },
  timeout: 10000, // 10 segundos de timeout
  requestOptions: {
    rejectUnauthorized: false,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
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
    'reuters-business': 'https://feeds.reuters.com/reuters/businessNews',
    'bloomberg': 'https://feeds.bloomberg.com/markets/news.rss',
    'wsj-markets': 'https://feeds.a.dj.com/rss/RSSMarketsMain.xml'
  }
};

async function fetchFeed(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { 
      headers: { 'User-Agent': 'Mozilla/5.0' } 
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function cleanText(html) {
  if (!html) return '';
  return String(html)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

module.exports = async (req, res) => {
  const { lang = 'pt-BR', sourceKey } = req.query;
  console.log(`Iniciando busca por notícias: lang=${lang}, source=${sourceKey}`);

  if (!sourceKey || !RSS_FEEDS[lang] || !RSS_FEEDS[lang][sourceKey]) {
    const errorMsg = `Fonte de notícias inválida: lang=${lang}, sourceKey=${sourceKey}`;
    console.error(errorMsg);
    return res.status(400).json({ error: errorMsg });
  }

  const feedUrl = RSS_FEEDS[lang][sourceKey];
  console.log(`Processando feed: ${feedUrl}`);

  try {
    // Tentativa 1: Usar parser.parseURL
    let feed;
    try {
      feed = await parser.parseURL(feedUrl);
    } catch (parseError) {
      console.log('Falha no parseURL, tentando fetch manual...', parseError.message);
      // Tentativa 2: Fetch manual + parseString
      try {
        const xml = await fetchFeed(feedUrl);
        feed = await parser.parseString(xml);
      } catch (fetchError) {
        console.error('Falha no fetch manual:', fetchError);
        throw new Error(`Falha ao buscar o feed: ${fetchError.message}`);
      }
    }

    if (!feed || !Array.isArray(feed.items)) {
      throw new Error('Formato de feed inválido: items não encontrado');
    }

    const items = feed.items
      .filter(item => item && (item.title || item.link))
      .map(item => ({
        title: item.title?.trim() || 'Sem título',
        link: item.link?.trim() || '#',
        pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
        contentSnippet: cleanText(item.contentSnippet || item.content || item.description || ''),
        sourceName: (feed.title || sourceKey || 'Fonte desconhecida').toString(),
        imageUrl: item.enclosure?.url || item['media:content']?.url || null
      }))
      .slice(0, 10);

    if (items.length === 0) {
      console.warn('Nenhum item válido encontrado no feed');
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    return res.status(200).json({ items });

  } catch (error) {
    const errorMsg = `Erro ao processar ${sourceKey} (${feedUrl}): ${error.message}`;
    console.error(errorMsg);
    console.error('Stack:', error.stack);
    
    // Resposta de fallback com itens vazios para evitar quebra da UI
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({ 
      items: [],
      _error: errorMsg,
      _stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
