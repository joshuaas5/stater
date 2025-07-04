import { Link } from 'react-router-dom';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-green-600 mb-4">✅ SPA Routing Funcionando! v2</h1>
        <p className="text-gray-600 mb-4">
          Se você pode ver esta página, o roteamento SPA está funcionando corretamente.
          Esta é a versão 2 para testar cache.
        </p>
        <div className="space-y-2">
          <Link to="/privacy" className="block text-blue-600 hover:underline">
            → Testar página de Privacidade
          </Link>
          <Link to="/terms" className="block text-blue-600 hover:underline">
            → Testar página de Termos
          </Link>
          <Link to="/dashboard" className="block text-blue-600 hover:underline">
            → Voltar ao Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
