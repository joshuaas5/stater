import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingUp, Shield, Smartphone } from 'lucide-react';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="w-full py-6 px-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-8 w-8 text-indigo-600" />
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
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Controle suas finanças com
              <span className="text-indigo-600 block">inteligência artificial</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              O Stater é seu assistente financeiro pessoal que ajuda você a organizar gastos, 
              analisar extratos bancários e tomar decisões financeiras mais inteligentes.
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
              Junte-se a milhares de usuários que já estão no controle de suas finanças.
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
          <div className="flex items-center justify-center space-x-2 mb-4">
            <DollarSign className="h-6 w-6 text-indigo-600" />
            <span className="text-lg font-semibold text-gray-900 dark:text-white">Stater</span>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            © 2024 Stater. Todos os direitos reservados.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Assistente financeiro inteligente para controle de gastos pessoais
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
