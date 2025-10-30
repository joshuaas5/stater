import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Home, 
  Car, 
  Utensils,
  Zap,
  Heart,
  Smartphone,
  ArrowUpCircle,
  ArrowDownCircle
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export default function DemoPage() {
  // Dados fictícios de demonstração
  const demoData = {
    totalReceitas: 5420.00,
    totalDespesas: 3180.50,
    saldo: 2239.50,
    transacoes: [
      { id: 1, descricao: 'Salário Outubro', valor: 5000, tipo: 'receita', categoria: 'Trabalho', data: '2025-10-01', icon: DollarSign },
      { id: 2, descricao: 'Freelance Design', valor: 420, tipo: 'receita', categoria: 'Extra', data: '2025-10-15', icon: DollarSign },
      { id: 3, descricao: 'Aluguel', valor: -1200, tipo: 'despesa', categoria: 'Moradia', data: '2025-10-05', icon: Home },
      { id: 4, descricao: 'Supermercado Extra', valor: -350, tipo: 'despesa', categoria: 'Alimentação', data: '2025-10-10', icon: ShoppingCart },
      { id: 5, descricao: 'Restaurante Italiano', valor: -180, tipo: 'despesa', categoria: 'Alimentação', data: '2025-10-12', icon: Utensils },
      { id: 6, descricao: 'Gasolina', valor: -250, tipo: 'despesa', categoria: 'Transporte', data: '2025-10-08', icon: Car },
      { id: 7, descricao: 'Conta de Luz', valor: -120, tipo: 'despesa', categoria: 'Utilidades', data: '2025-10-20', icon: Zap },
      { id: 8, descricao: 'Academia', valor: -90, tipo: 'despesa', categoria: 'Saúde', data: '2025-10-01', icon: Heart },
      { id: 9, descricao: 'Netflix + Spotify', valor: -50, tipo: 'despesa', categoria: 'Entretenimento', data: '2025-10-15', icon: Smartphone },
      { id: 10, descricao: 'Uber', valor: -80, tipo: 'despesa', categoria: 'Transporte', data: '2025-10-18', icon: Car },
    ]
  };

  // Dados para o gráfico de pizza (categorias de despesas)
  const despesasPorCategoria = [
    { name: 'Moradia', value: 1200, color: '#3b82f6' },
    { name: 'Alimentação', value: 530, color: '#10b981' },
    { name: 'Transporte', value: 330, color: '#f59e0b' },
    { name: 'Utilidades', value: 120, color: '#ef4444' },
    { name: 'Saúde', value: 90, color: '#8b5cf6' },
    { name: 'Entretenimento', value: 50, color: '#ec4899' },
  ];

  // Dados para o gráfico de linha (evolução mensal)
  const evolucaoMensal = [
    { mes: 'Jun', receitas: 4800, despesas: 3200, saldo: 1600 },
    { mes: 'Jul', receitas: 5200, despesas: 3400, saldo: 1800 },
    { mes: 'Ago', receitas: 4900, despesas: 3100, saldo: 1800 },
    { mes: 'Set', receitas: 5100, despesas: 3300, saldo: 1800 },
    { mes: 'Out', receitas: 5420, despesas: 3180, saldo: 2240 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-indigo-900">
      {/* BANNER DE DEMONSTRAÇÃO */}
      <div className="bg-yellow-400 text-gray-900 p-4 text-center font-semibold shadow-lg sticky top-0 z-50">
        <p className="text-lg">
          🎯 <strong>Demonstração do Stater</strong> - Dados fictícios para ilustração • 
          <Link to="/login" className="underline ml-2 hover:text-blue-700">
            Faça login para usar de verdade →
          </Link>
        </p>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Dashboard Financeiro
          </h1>
          <p className="text-blue-200 text-lg">
            Visualize seu controle financeiro completo em um só lugar
          </p>
        </div>

        {/* CARDS DE RESUMO */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium opacity-90">Receitas</h3>
              <ArrowUpCircle className="w-8 h-8 opacity-80" />
            </div>
            <p className="text-4xl font-bold mb-2">
              R$ {demoData.totalReceitas.toFixed(2)}
            </p>
            <p className="text-green-100 text-sm">+12% vs. mês anterior</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-red-500 to-red-600 text-white shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium opacity-90">Despesas</h3>
              <ArrowDownCircle className="w-8 h-8 opacity-80" />
            </div>
            <p className="text-4xl font-bold mb-2">
              R$ {demoData.totalDespesas.toFixed(2)}
            </p>
            <p className="text-red-100 text-sm">-5% vs. mês anterior</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium opacity-90">Saldo</h3>
              <TrendingUp className="w-8 h-8 opacity-80" />
            </div>
            <p className="text-4xl font-bold mb-2">
              R$ {demoData.saldo.toFixed(2)}
            </p>
            <p className="text-blue-100 text-sm">Economia de 41% da renda</p>
          </Card>
        </div>

        {/* GRÁFICOS */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* GRÁFICO DE PIZZA */}
          <Card className="p-6 bg-white shadow-xl">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Despesas por Categoria
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={despesasPorCategoria}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {despesasPorCategoria.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* GRÁFICO DE LINHA */}
          <Card className="p-6 bg-white shadow-xl">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Evolução Mensal
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={evolucaoMensal}>
                <XAxis dataKey="mes" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                <Legend />
                <Line type="monotone" dataKey="receitas" stroke="#10b981" strokeWidth={3} name="Receitas" />
                <Line type="monotone" dataKey="despesas" stroke="#ef4444" strokeWidth={3} name="Despesas" />
                <Line type="monotone" dataKey="saldo" stroke="#3b82f6" strokeWidth={3} name="Saldo" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* LISTA DE TRANSAÇÕES */}
        <Card className="p-6 bg-white shadow-xl mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Últimas Transações</h2>
          <div className="space-y-3">
            {demoData.transacoes.map(t => {
              const Icon = t.icon;
              return (
                <div 
                  key={t.id} 
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${t.tipo === 'receita' ? 'bg-green-100' : 'bg-red-100'}`}>
                      <Icon className={`w-5 h-5 ${t.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{t.descricao}</p>
                      <p className="text-sm text-gray-500">
                        {t.categoria} • {new Date(t.data).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <p className={`font-bold text-lg ${t.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.tipo === 'receita' ? '+' : '-'} R$ {Math.abs(t.valor).toFixed(2)}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* RECURSOS PREMIUM */}
        <Card className="p-8 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white shadow-2xl mb-8">
          <h2 className="text-3xl font-bold mb-6 text-center">
            ✨ Recursos Disponíveis no Stater
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur p-5 rounded-lg">
              <h3 className="text-xl font-bold mb-3">🎤 Comandos de Voz</h3>
              <p className="text-white/90">
                Registre despesas falando naturalmente. "Gastei 50 reais no mercado" 
                e pronto - a IA categoriza automaticamente.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur p-5 rounded-lg">
              <h3 className="text-xl font-bold mb-3">📸 OCR de Documentos</h3>
              <p className="text-white/90">
                Tire fotos de notas fiscais e extratos. Nossa IA extrai todos os 
                dados automaticamente. Sem digitação manual.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur p-5 rounded-lg">
              <h3 className="text-xl font-bold mb-3">💬 Chat com IA</h3>
              <p className="text-white/90">
                Converse com seu assistente financeiro. Pergunte sobre gastos, 
                receba análises e dicas personalizadas.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur p-5 rounded-lg">
              <h3 className="text-xl font-bold mb-3">📊 Relatórios Detalhados</h3>
              <p className="text-white/90">
                Gráficos interativos, exportação em Excel/PDF, categorização 
                inteligente e muito mais.
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link to="/login">
              <Button 
                size="lg" 
                className="bg-white text-purple-600 hover:bg-gray-100 font-bold text-lg px-8 py-6 shadow-xl"
              >
                🚀 Criar Conta Grátis Agora
              </Button>
            </Link>
            <p className="mt-4 text-white/80">
              Sem cartão de crédito • Comece em 30 segundos
            </p>
          </div>
        </Card>

        {/* COMPARAÇÃO PLANOS */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 bg-white shadow-xl">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Plano Gratuito</h3>
              <p className="text-4xl font-bold text-blue-600">R$ 0</p>
              <p className="text-gray-500">para sempre</p>
            </div>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Transações ilimitadas</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Categorização automática</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Gráficos básicos</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>50 comandos de voz/mês</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>10 OCRs/mês</span>
              </li>
            </ul>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-xl border-4 border-yellow-400">
            <div className="text-center mb-6">
              <div className="inline-block bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-bold mb-3">
                MAIS POPULAR
              </div>
              <h3 className="text-2xl font-bold mb-2">Plano Premium</h3>
              <p className="text-4xl font-bold">R$ 9,90</p>
              <p className="text-purple-200">por mês</p>
            </div>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <span className="text-yellow-300">✓</span>
                <span>Tudo do plano gratuito</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-yellow-300">✓</span>
                <span>Comandos de voz ilimitados</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-yellow-300">✓</span>
                <span>OCR ilimitado</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-yellow-300">✓</span>
                <span>Chat com IA ilimitado</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-yellow-300">✓</span>
                <span>Exportação Excel/PDF</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-yellow-300">✓</span>
                <span>Sem anúncios</span>
              </li>
            </ul>
          </Card>
        </div>

        {/* CTA FINAL */}
        <Card className="p-10 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center shadow-2xl">
          <h2 className="text-4xl font-bold mb-4">
            Pronto Para Transformar Suas Finanças?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Junte-se a milhares de usuários que já controlam melhor seu dinheiro
          </p>
          <Link to="/login">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100 font-bold text-xl px-12 py-6 shadow-xl"
            >
              Começar Agora - É Grátis
            </Button>
          </Link>
          <p className="mt-4 text-blue-200">
            ⚡ Configuração em menos de 1 minuto
          </p>
        </Card>

        {/* FOOTER INFO */}
        <div className="mt-12 text-center text-blue-200">
          <p className="mb-2">
            <strong>Stater</strong> - Controle Financeiro Inteligente com IA
          </p>
          <div className="flex justify-center gap-6 text-sm">
            <Link to="/terms" className="hover:text-white underline">Termos de Uso</Link>
            <Link to="/privacy" className="hover:text-white underline">Privacidade</Link>
            <a href="mailto:staterbills@gmail.com" className="hover:text-white underline">
              Contato
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
