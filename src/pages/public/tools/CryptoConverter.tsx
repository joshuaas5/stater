import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Coins, ArrowRight, RefreshCw, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import SEO from '@/components/SEO';

interface CryptoPrice { id: string; symbol: string; name: string; current_price: number; price_change_percentage_24h: number; image: string; }

const CryptoConverter: React.FC = () => {
  const [cryptos, setCryptos] = useState<CryptoPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState(1);
  const [fromCrypto, setFromCrypto] = useState('bitcoin');
  const [toCurrency, setToCurrency] = useState('brl');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const currencies = [{ id: 'brl', name: 'Real Brasileiro', symbol: 'R$' }, { id: 'usd', name: 'Dolar Americano', symbol: '$' }, { id: 'eur', name: 'Euro', symbol: 'E' }];

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=" + toCurrency + "&ids=bitcoin,ethereum,binancecoin,solana,cardano,dogecoin,ripple,polkadot&order=market_cap_desc&sparkline=false";
      const response = await fetch(url);
      const data = await response.json();
      setCryptos(data);
      setLastUpdate(new Date());
    } catch (error) { console.error('Erro ao buscar precos:', error); }
    setLoading(false);
  };

  useEffect(() => { fetchPrices(); const interval = setInterval(fetchPrices, 60000); return () => clearInterval(interval); }, [toCurrency]);

  const selectedCrypto = cryptos.find(c => c.id === fromCrypto);
  const convertedValue = selectedCrypto ? amount * selectedCrypto.current_price : 0;
  const currencySymbol = currencies.find(c => c.id === toCurrency)?.symbol || 'R$';

  const formatNumber = (num: number) => {
    if (num >= 1000) return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (num >= 1) return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 8 });
  };

  return (
    <>
      <SEO title="Conversor de Criptomoedas - Bitcoin, Ethereum em Real" description="Converta Bitcoin, Ethereum, Solana é outras criptomoedas para Real, Dolar é Euro. Cotacao em tempo real." canonical="/ferramentas/conversor-cripto" keywords="conversor bitcoin, bitcoin para real, ethereum cotacao, preço cripto hoje" />
      <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white">
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-amber-600/10 rounded-full blur-[120px]"></div>
        </div>
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#0f172a]/90 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3"><img src="/stater-logo-96.webp" alt="Stater" className="w-9 h-9 rounded-xl" /><span className="text-2xl font-bold" style={{ fontFamily: "'Fredoka One', sans-serif", textShadow: '#3B82F6 2px 2px 0px, #1D4ED8 4px 4px 0px' }}>Stater</span></Link>
            <div className="flex items-center gap-3"><Link to="/ferramentas" className="text-white/60 hover:text-white text-sm hidden sm:block">Ferramentas</Link><Link to="/login?view=register" className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 rounded-lg text-sm font-medium">Criar Conta</Link></div>
          </div>
        </header>
        <main className="relative z-10 pt-24 pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            <nav className="text-sm text-white/40 mb-6"><Link to="/" className="hover:text-white">Stater</Link> &gt; <Link to="/ferramentas" className="hover:text-white">Ferramentas</Link> &gt; <span className="text-white/70">Conversor Cripto</span></nav>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center"><Coins className="w-7 h-7" /></div>
              <div><h1 className="text-3xl sm:text-4xl font-bold">Conversor de Criptomoedas</h1><p className="text-white/50 flex items-center gap-2">Cotacao em tempo real {lastUpdate && <span className="text-xs">- Atualizado {lastUpdate.toLocaleTimeString('pt-BR')}</span>}</p></div>
            </div>
            <div className="bg-slate-800 text-white border border-slate-600/10 rounded-2xl p-6 mb-8">
              <div className="grid md:grid-cols-3 gap-6 items-end">
                <div><label className="block text-sm text-white/70 mb-2">Quantidade</label><input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full bg-slate-800 text-white border border-slate-600/10 rounded-lg px-4 py-3 text-xl focus:border-orange-500 outline-none" /></div>
                <div><label className="block text-sm text-white/70 mb-2">Criptomoeda</label><select value={fromCrypto} onChange={(e) => setFromCrypto(e.target.value)} className="w-full bg-slate-800 text-white border border-slate-600/10 rounded-lg px-4 py-3 text-lg focus:border-orange-500 outline-none">{cryptos.map((crypto) => (<option key={crypto.id} value={crypto.id} className="bg-slate-800">{crypto.name} ({crypto.symbol.toUpperCase()})</option>))}</select></div>
                <div><label className="block text-sm text-white/70 mb-2">Moeda</label><select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)} className="w-full bg-slate-800 text-white border border-slate-600/10 rounded-lg px-4 py-3 text-lg focus:border-orange-500 outline-none">{currencies.map((currency) => (<option key={currency.id} value={currency.id} className="bg-slate-800">{currency.name} ({currency.symbol})</option>))}</select></div>
              </div>
              <div className="mt-6 p-6 bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/30 rounded-xl">
                <p className="text-white/60 text-sm mb-1">{amount} {selectedCrypto?.symbol.toUpperCase()} equivale a</p>
                <p className="text-4xl sm:text-5xl font-bold text-orange-400">{currencySymbol} {formatNumber(convertedValue)}</p>
                {selectedCrypto && <p className="mt-2 text-sm flex items-center gap-2"><span className="text-white/50">1 {selectedCrypto.symbol.toUpperCase()} = {currencySymbol} {formatNumber(selectedCrypto.current_price)}</span><span className={selectedCrypto.price_change_percentage_24h >= 0 ? 'text-emerald-400 flex items-center gap-1' : 'text-red-400 flex items-center gap-1'}>{selectedCrypto.price_change_percentage_24h >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}{selectedCrypto.price_change_percentage_24h.toFixed(2)}%</span></p>}
              </div>
              <button onClick={fetchPrices} disabled={loading} className="mt-4 flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"><RefreshCw className={loading ? 'w-4 h-4 animate-spin' : 'w-4 h-4'} />Atualizar cotações</button>
            </div>
            <h2 className="text-xl font-bold mb-4">Cotações em Tempo Real</h2>
            <div className="grid sm:grid-cols-2 gap-4 mb-12">
              {cryptos.map((crypto) => (<button key={crypto.id} onClick={() => setFromCrypto(crypto.id)} className={fromCrypto === crypto.id ? 'flex items-center gap-4 p-4 rounded-xl border transition-all text-left bg-orange-900/300/20 border-orange-500/50' : 'flex items-center gap-4 p-4 rounded-xl border transition-all text-left bg-slate-800/5 border-white/10 hover:bg-slate-800/10'}><img src={crypto.image} alt={crypto.name} className="w-10 h-10 rounded-full" /><div className="flex-1"><p className="font-medium">{crypto.name}</p><p className="text-sm text-white/50">{crypto.symbol.toUpperCase()}</p></div><div className="text-right"><p className="font-mono">{currencySymbol} {formatNumber(crypto.current_price)}</p><p className={crypto.price_change_percentage_24h >= 0 ? 'text-sm text-emerald-400' : 'text-sm text-red-400'}>{crypto.price_change_percentage_24h >= 0 ? '+' : ''}{crypto.price_change_percentage_24h.toFixed(2)}%</p></div></button>))}
            </div>
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6 text-center">
              <Sparkles className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h3 className="text-xl font-bold mb-2">Acompanhe seu portfolio cripto no Stater</h3>
              <p className="text-white/60 mb-4">Conecte suas carteiras é veja tudo em um só lugar. De graca.</p>
              <Link to="/login?view=register" className="inline-flex items-center gap-2 bg-slate-800 text-white text-slate-900 font-medium px-6 py-3 rounded-lg hover:bg-slate-800 text-white/90 transition-colors">Criar Conta Gratis <ArrowRight className="w-4 h-4" /></Link>
            </div>
          </div>
        </main>
        <footer className="relative z-10 border-t border-white/5 py-8 px-4"><div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/40"><p>2026 Stater. Cotações fornecidas por CoinGecko.</p><div className="flex gap-6"><Link to="/ferramentas" className="hover:text-white">Mais Ferramentas</Link><Link to="/privacy" className="hover:text-white">Privacidade</Link></div></div></footer>
      </div>
    </>
  );
};

export default CryptoConverter;
