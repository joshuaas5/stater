/**
 * Detecta se o visitante é um bot/crawler (Google, Bing, etc)
 */
export const isBot = (): boolean => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  const userAgent = navigator.userAgent.toLowerCase();
  
  const botPatterns = [
    'googlebot',
    'google-inspectiontool',
    'adsbot-google',
    'mediapartners-google',
    'bingbot',
    'slurp', // Yahoo
    'duckduckbot',
    'baiduspider',
    'yandexbot',
    'facebookexternalhit',
    'twitterbot',
    'linkedinbot',
    'whatsapp',
    'telegrambot',
    'applebot',
    'crawler',
    'spider',
    'bot',
    'lighthouse', // Google Lighthouse
    'pagespeed', // Google PageSpeed
  ];

  return botPatterns.some(pattern => userAgent.includes(pattern));
};

/**
 * Verifica se é especificamente o GoogleBot (para AdSense)
 */
export const isGoogleBot = (): boolean => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  const userAgent = navigator.userAgent.toLowerCase();
  
  return (
    userAgent.includes('googlebot') ||
    userAgent.includes('adsbot-google') ||
    userAgent.includes('mediapartners-google') ||
    userAgent.includes('google-inspectiontool')
  );
};
