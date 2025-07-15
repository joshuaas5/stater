import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TrendingUp, Shield, Smartphone } from 'lucide-react';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="w-full py-6 px-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img 
              src="/stater-logo.png" 
              alt="Stater Logo" 
              className="h-10 w-10 rounded-lg shadow-md"
            />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Stater</h1>
          </div>
          <div className="flex space-x-4">
            <Link to="/login">
              <Button variant="outline" className="hidden sm:flex">
                Entrar
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                Cadastrar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="w-full">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-16">
            {/* Logo em destaque */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-600 rounded-full blur-xl opacity-20 animate-pulse"></div>
                <img 
                  src="/stater-logo.png" 
                  alt="Stater - Assistente Financeiro IA" 
                  className="relative h-24 w-24 md:h-32 md:w-32 rounded-2xl shadow-2xl ring-4 ring-indigo-600/20 hover:ring-indigo-600/40 transition-all duration-300"
                />
              </div>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Controle suas finanças com
              <span className="text-indigo-600 block">inteligência artificial</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-2 max-w-3xl mx-auto">
              O Stater é seu assistente financeiro pessoal que ajuda você a organizar gastos, 
              analisar extratos bancários e tomar decisões financeiras mais inteligentes.
            </p>
            <p className="text-lg text-indigo-600 font-semibold mb-8">
              Inteligência para prosperar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 px-8 py-4 text-lg">
                  Começar gratuitamente
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="px-8 py-4 text-lg">
                  Já tenho uma conta
                </Button>
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-6">
              <div className="bg-indigo-100 dark:bg-indigo-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Análise Inteligente
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Nossa IA analisa seus gastos e oferece insights personalizados para melhorar sua saúde financeira.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-indigo-100 dark:bg-indigo-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Segurança Total
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Seus dados são protegidos com criptografia de ponta e nunca compartilhamos suas informações.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-indigo-100 dark:bg-indigo-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Smartphone className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Sempre Disponível
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Acesse de qualquer dispositivo, a qualquer hora. Funciona perfeitamente em celulares e computadores.
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Pronto para transformar suas finanças?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Comece sua jornada rumo a prosperidade financeira, com inteligência.
            </p>
            <Link to="/register">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 px-8 py-4">
                Criar conta gratuita
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 px-4 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img 
              src="/stater-logo.png" 
              alt="Stater Logo" 
              className="h-8 w-8 rounded-lg shadow-sm"
            />
            <span className="text-lg font-semibold text-gray-900 dark:text-white">Stater</span>
          </div>
          <div className="flex justify-center space-x-6 mb-4">
            <Link 
              to="/terms" 
              className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
            >
              Termos de Uso
            </Link>
            <Link 
              to="/privacy" 
              className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
            >
              Política de Privacidade
            </Link>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            © 2025 Stater. Todos os direitos reservados.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Inteligência para prosperar
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
