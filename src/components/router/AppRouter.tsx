import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import AuthLoadingScreen from '@/components/auth/AuthLoadingScreen';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import PersistentLayout from '@/components/layout/PersistentLayout';
import { Capacitor } from '@capacitor/core';

// Importação crítica (primeira tela)
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/Login';

// Lazy loading para rotas secundárias (code splitting)
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const FinancialAdvisorPage = lazy(() => import('@/pages/FinancialAdvisorPage'));
const FinancialAnalysisPage = lazy(() => import('@/pages/FinancialAnalysisPage'));
const Transactions = lazy(() => import('@/pages/Transactions'));
const BillsPage = lazy(() => import('@/pages/BillsPage'));
const AddBillPage = lazy(() => import('@/pages/AddBillPage'));
const ChartsPage = lazy(() => import('@/pages/ChartsPage'));
const ExportReportPage = lazy(() => import('@/pages/ExportReportPage'));
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'));
const PreferencesPage = lazy(() => import('@/pages/PreferencesPage'));
const SecurityPage = lazy(() => import('@/pages/SecurityPage'));
const TelegramSettingsPage = lazy(() => import('@/pages/TelegramSettingsPage'));
const TermsOfService = lazy(() => import('@/pages/TermsPage'));
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPage'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const ProfilePage = lazy(() => import('@/pages/Profile'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const RecurringTransactionsPage = lazy(() => import('@/pages/RecurringTransactionsPage'));
const GoalsPage = lazy(() => import('@/pages/GoalsPage'));
const ProjectedBalancePage = lazy(() => import('@/pages/ProjectedBalancePage'));

// Ferramentas SEO
const ToolsHub = lazy(() => import("@/pages/public/ToolsHub"));
const CompoundInterestCalculator = lazy(() => import("@/pages/public/tools/CompoundInterestCalculator"));
const CryptoConverter = lazy(() => import("@/pages/public/tools/CryptoConverter"));
const CDICalculator = lazy(() => import("@/pages/public/tools/CDICalculator"));
const SimuladorInvestimentos = lazy(() => import("@/pages/public/tools/SimuladorInvestimentos"));
const CalculadoraInflacao = lazy(() => import("@/pages/public/tools/CalculadoraInflacao"));
const CalculadoraMetas = lazy(() => import("@/pages/public/tools/CalculadoraMetas"));
const SimuladorFinanciamento = lazy(() => import("@/pages/public/tools/SimuladorFinanciamento"));
const CalculadoraSalarioCLTPJ = lazy(() => import("@/pages/public/tools/CalculadoraSalarioCLTPJ"));

// Blog SEO
const BlogHub = lazy(() => import("@/pages/public/BlogHub"));
const ComoJuntarDinheiroRapido = lazy(() => import("@/pages/public/blog/ComoJuntarDinheiroRapido"));
const Regra503020 = lazy(() => import("@/pages/public/blog/Regra503020"));
const ComoSairDasDividas = lazy(() => import("@/pages/public/blog/ComoSairDasDividas"));
const InvestirComPoucoDinheiro = lazy(() => import("@/pages/public/blog/InvestirComPoucoDinheiro"));
const ReservaDeEmergencia = lazy(() => import("@/pages/public/blog/ReservaDeEmergencia"));
const CartaoDeCreditoVilaoOuAliado = lazy(() => import("@/pages/public/blog/CartaoDeCreditoVilaoOuAliado"));
const MetasFinanceiras = lazy(() => import("@/pages/public/blog/MetasFinanceiras"));
const EducacaoFinanceiraCriancas = lazy(() => import("@/pages/public/blog/EducacaoFinanceiraCriancas"));
const CdiSelicIpca = lazy(() => import("@/pages/public/blog/CdiSelicIpca"));
const AppsControleFinanceiro = lazy(() => import("@/pages/public/blog/AppsControleFinanceiro"));
const ComoInvestir100Reais = lazy(() => import("@/pages/public/blog/ComoInvestir100Reais"));
const TesouroDiretoIniciantes = lazy(() => import("@/pages/public/blog/TesouroDiretoIniciantes"));
const RendaExtra20Formas = lazy(() => import("@/pages/public/blog/RendaExtra20Formas"));
const Calculadora13Salario = lazy(() => import("@/pages/public/tools/Calculadora13Salario"));
const CalculadoraFerias = lazy(() => import("@/pages/public/tools/CalculadoraFerias"));
const ComoNegociarDividas = lazy(() => import("@/pages/public/blog/ComoNegociarDividas"));
const ScoreCredito = lazy(() => import("@/pages/public/blog/ScoreCredito"));
const OrcamentoFamiliar = lazy(() => import("@/pages/public/blog/OrcamentoFamiliar"));
const CartaoCreditoVilaoOuAliado = lazy(() => import("@/pages/public/blog/CartaoCreditoVilaoOuAliado"));
const PixGuiaCompleto = lazy(() => import("@/pages/public/blog/PixGuiaCompleto"));


const IndependenciaFinanceira = lazy(() => import("@/pages/public/blog/IndependenciaFinanceira"));
const ImpostoDeRenda = lazy(() => import("@/pages/public/blog/ImpostoDeRenda"));
const CalculadoraIR = lazy(() => import("@/pages/public/tools/CalculadoraIR"));

const FundosImobiliarios = lazy(() => import("@/pages/public/blog/FundosImobiliarios"));
const FinancasParaCasais = lazy(() => import("@/pages/public/blog/FinancasParaCasais"));
const PrevidenciaPrivada = lazy(() => import("@/pages/public/blog/PrevidenciaPrivada"));
const PrimeiroImovel = lazy(() => import("@/pages/public/blog/PrimeiroImovel"));
const EconomiaSupermercado = lazy(() => import("@/pages/public/blog/EconomiaSupermercado"));
const CalculadoraFGTS = lazy(() => import("@/pages/public/tools/CalculadoraFGTS"));
const CalculadoraEmprestimo = lazy(() => import("@/pages/public/tools/CalculadoraEmprestimo"));
const CLTvsPJGuia = lazy(() => import("@/pages/public/blog/CLTvsPJGuia"));
const SeguroDeVida = lazy(() => import("@/pages/public/blog/SeguroDeVida"));
const ConsorcioValeAPena = lazy(() => import("@/pages/public/blog/ConsorcioValeAPena"));
const BlackFridayDicas = lazy(() => import("@/pages/public/blog/BlackFridayDicas"));
const GolpesFinanceiros = lazy(() => import("@/pages/public/blog/GolpesFinanceiros"));
const CalculadoraAposentadoria = lazy(() => import("@/pages/public/tools/CalculadoraAposentadoria"));
const InvestimentosIniciantes = lazy(() => import("@/pages/public/blog/InvestimentosIniciantes"));
const EconomizarEnergia = lazy(() => import("@/pages/public/blog/EconomizarEnergia"));
const AposentadoriaINSS = lazy(() => import("@/pages/public/blog/AposentadoriaINSS"));
const DividendosAcoes = lazy(() => import("@/pages/public/blog/DividendosAcoes"));
const CalculadoraAluguel = lazy(() => import("@/pages/public/tools/CalculadoraAluguel"));
const PlanejamentoFinanceiroAnual = lazy(() => import("@/pages/public/blog/PlanejamentoFinanceiroAnual"));
const CriptomoedaIniciantes = lazy(() => import("@/pages/public/blog/CriptomoedaIniciantes"));
const FreelancerFinancas = lazy(() => import("@/pages/public/blog/FreelancerFinancas"));
const CalculadoraDividendos = lazy(() => import("@/pages/public/tools/CalculadoraDividendos"));
const CarteiraMotoristasApp = lazy(() => import("@/pages/public/blog/CarteiraMotoristasApp"));
const MiniContratosB3 = lazy(() => import("@/pages/public/blog/MiniContratosB3"));
const SeguroViagem = lazy(() => import("@/pages/public/blog/SeguroViagem"));
const ImpostoRenda = lazy(() => import("@/pages/public/blog/ImpostoRenda"));
const CalculadoraRescisao = lazy(() => import("@/pages/public/tools/CalculadoraRescisao"));
const MilhasAereas = lazy(() => import("@/pages/public/blog/MilhasAereas"));
const FinancasAposAposentadoria = lazy(() => import("@/pages/public/blog/FinancasAposAposentadoria"));
const ContaBancariaDigital = lazy(() => import("@/pages/public/blog/ContaBancariaDigital"));
const CalculadoraSalarioLiquido = lazy(() => import("@/pages/public/tools/CalculadoraSalarioLiquido"));
const ComprarCasaOuAlugar = lazy(() => import("@/pages/public/blog/ComprarCasaOuAlugar"));
const EducacaoFinanceiraFilhos = lazy(() => import("@/pages/public/blog/EducacaoFinanceiraFilhos"));
const CalculadoraIPVA = lazy(() => import("@/pages/public/tools/CalculadoraIPVA"));
const CDBvsTesourovsLCI = lazy(() => import("@/pages/public/blog/CDBvsTesourovsLCI"));
const MEIGuiaCompleto = lazy(() => import("@/pages/public/blog/MEIGuiaCompleto"));
const BolsaValoresIniciantes = lazy(() => import("@/pages/public/blog/BolsaValoresIniciantes"));
const BolsaFamiliaGuia = lazy(() => import("@/pages/public/blog/BolsaFamiliaGuia"));
const CalculadoraIMC = lazy(() => import("@/pages/public/tools/CalculadoraIMC"));
const CalculadoraFGTSNew = lazy(() => import("@/pages/public/tools/CalculadoraFGTS"));
/**
 * Componente para redirecionar raiz baseado em autenticação
 */
const RootRedirect: React.FC = () => {
  const { isAuthenticated } = useAuthGuard();
  
  // Se está autenticado, vai direto para o dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Se é mobile e não autenticado, vai para login
  if (Capacitor.isNativePlatform() && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Se não está autenticado e é web, mostra a HomePage
  return <HomePage />;
};

/**
 * Componente principal de roteamento com autenticação protegida
 * Elimina o "pisca-pisca" aguardando a verificação de autenticação
 */
const AppRouter: React.FC = () => {
  const { isLoading } = useAuthGuard();

  // Exibe tela de carregamento durante verificação inicial
  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  return (
    <Suspense fallback={<AuthLoadingScreen />}>
      <Routes>
        {/* Rotas públicas - redirecionam para dashboard se autenticado */}
        <Route 
          path="/" 
          element={<RootRedirect />}
        />
        <Route 
          path="/home" 
          element={
            <ProtectedRoute requireAuth={false}>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/demo" 
          element={<Navigate to="/" replace />}
        />
        <Route 
          path="/login" 
          element={
            <ProtectedRoute requireAuth={false}>
              <LoginPage />
            </ProtectedRoute>
          } 
        />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />

                {/* Ferramentas SEO */}
        <Route path="/ferramentas" element={<ToolsHub />} />
        <Route path="/ferramentas/calculadora-juros-compostos" element={<CompoundInterestCalculator />} />
        <Route path="/ferramentas/conversor-cripto" element={<CryptoConverter />} />
        <Route path="/ferramentas/calculadora-cdi" element={<CDICalculator />} />
        <Route path="/ferramentas/simulador-investimentos" element={<SimuladorInvestimentos />} />
        <Route path="/ferramentas/calculadora-inflacao" element={<CalculadoraInflacao />} />
        <Route path="/ferramentas/calculadora-metas" element={<CalculadoraMetas />} />
        <Route path="/ferramentas/simulador-financiamento" element={<SimuladorFinanciamento />} />
        <Route path="/ferramentas/calculadora-clt-pj" element={<CalculadoraSalarioCLTPJ />} />
        <Route path="/ferramentas/calculadora-13-salario" element={<Calculadora13Salario />} />
        <Route path="/ferramentas/calculadora-ferias" element={<CalculadoraFerias />} />
        <Route path="/ferramentas/calculadora-ir" element={<CalculadoraIR />} />
        <Route path="/ferramentas/calculadora-fgts" element={<CalculadoraFGTS />} />
        <Route path="/ferramentas/calculadora-emprestimo" element={<CalculadoraEmprestimo />} />
        <Route path="/ferramentas/calculadora-aposentadoria" element={<CalculadoraAposentadoria />} />
        <Route path="/ferramentas/calculadora-aluguel" element={<CalculadoraAluguel />} />
        <Route path="/ferramentas/calculadora-dividendos" element={<CalculadoraDividendos />} />
        <Route path="/ferramentas/calculadora-rescisao" element={<CalculadoraRescisao />} />
        <Route path="/ferramentas/calculadora-salario-liquido" element={<CalculadoraSalarioLiquido />} />
        <Route path="/ferramentas/calculadora-ipva" element={<CalculadoraIPVA />} />
        <Route path="/ferramentas/calculadora-imc" element={<CalculadoraIMC />} />

        {/* Blog SEO */}
        <Route path="/blog" element={<BlogHub />} />
        <Route path="/blog/como-juntar-dinheiro-rapido" element={<ComoJuntarDinheiroRapido />} />
        <Route path="/blog/regra-50-30-20" element={<Regra503020 />} />
        <Route path="/blog/como-sair-das-dividas" element={<ComoSairDasDividas />} />
        <Route path="/blog/investir-com-pouco-dinheiro" element={<InvestirComPoucoDinheiro />} />
        <Route path="/blog/reserva-de-emergencia" element={<ReservaDeEmergencia />} />
        <Route path="/blog/cartao-de-credito-vilao-ou-aliado" element={<CartaoDeCreditoVilaoOuAliado />} />
        <Route path="/blog/metas-financeiras" element={<MetasFinanceiras />} />
        <Route path="/blog/educacao-financeira-criancas" element={<EducacaoFinanceiraCriancas />} />
        <Route path="/blog/cdi-selic-ipca" element={<CdiSelicIpca />} />
        <Route path="/blog/apps-controle-financeiro" element={<AppsControleFinanceiro />} />
        <Route path="/blog/como-investir-100-reais" element={<ComoInvestir100Reais />} />
        <Route path="/blog/tesouro-direto-iniciantes" element={<TesouroDiretoIniciantes />} />
        <Route path="/blog/renda-extra-20-formas" element={<RendaExtra20Formas />} />        <Route path="/blog/como-negociar-dividas" element={<ComoNegociarDividas />} />
        <Route path="/blog/score-credito" element={<ScoreCredito />} />
        <Route path="/blog/orcamento-familiar" element={<OrcamentoFamiliar />} />
        <Route path="/blog/cartao-credito-vilao-aliado" element={<CartaoCreditoVilaoOuAliado />} />
        <Route path="/blog/pix-guia-completo" element={<PixGuiaCompleto />} />
        <Route path="/blog/independencia-financeira" element={<IndependenciaFinanceira />} />
        <Route path="/blog/imposto-de-renda" element={<ImpostoDeRenda />} />
        <Route path="/blog/fundos-imobiliarios" element={<FundosImobiliarios />} />
        <Route path="/blog/financas-para-casais" element={<FinancasParaCasais />} />
        <Route path="/blog/previdencia-privada" element={<PrevidenciaPrivada />} />
        <Route path="/blog/primeiro-imovel" element={<PrimeiroImovel />} />
        <Route path="/blog/economia-supermercado" element={<EconomiaSupermercado />} />
        <Route path="/blog/clt-vs-pj" element={<CLTvsPJGuia />} />
        <Route path="/blog/seguro-de-vida" element={<SeguroDeVida />} />
        <Route path="/blog/consorcio-vale-a-pena" element={<ConsorcioValeAPena />} />
        <Route path="/blog/black-friday-dicas" element={<BlackFridayDicas />} />
        <Route path="/blog/golpes-financeiros" element={<GolpesFinanceiros />} />
        <Route path="/blog/investimentos-iniciantes" element={<InvestimentosIniciantes />} />
        <Route path="/blog/economizar-energia" element={<EconomizarEnergia />} />
        <Route path="/blog/aposentadoria-inss" element={<AposentadoriaINSS />} />
        <Route path="/blog/dividendos-acoes" element={<DividendosAcoes />} />
        <Route path="/blog/planejamento-financeiro-anual" element={<PlanejamentoFinanceiroAnual />} />
        <Route path="/blog/criptomoedas-iniciantes" element={<CriptomoedaIniciantes />} />
        <Route path="/blog/freelancer-financas" element={<FreelancerFinancas />} />
        <Route path="/blog/carteira-motoristas-app" element={<CarteiraMotoristasApp />} />
        <Route path="/blog/mini-contratos-b3" element={<MiniContratosB3 />} />
        <Route path="/blog/seguro-viagem" element={<SeguroViagem />} />
        <Route path="/blog/imposto-renda-guia" element={<ImpostoRenda />} />
        <Route path="/blog/milhas-aereas" element={<MilhasAereas />} />
        <Route path="/blog/financas-apos-aposentadoria" element={<FinancasAposAposentadoria />} />
        <Route path="/blog/conta-digital-comparativo" element={<ContaBancariaDigital />} />
        <Route path="/blog/comprar-ou-alugar-imovel" element={<ComprarCasaOuAlugar />} />
        <Route path="/blog/educacao-financeira-filhos" element={<EducacaoFinanceiraFilhos />} />
        <Route path="/blog/cdb-vs-tesouro-lci" element={<CDBvsTesourovsLCI />} />
        <Route path="/blog/mei-guia-completo" element={<MEIGuiaCompleto />} />
        <Route path="/blog/bolsa-de-valores-iniciantes" element={<BolsaValoresIniciantes />} />
        <Route path="/blog/bolsa-familia-guia" element={<BolsaFamiliaGuia />} />

        {/* Rotas protegidas - requerem autenticação */}
        <Route element={<PersistentLayout />}>
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute requireAuth={true}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/financial-advisor" 
            element={
              <ProtectedRoute requireAuth={true}>
                <FinancialAdvisorPage />
              </ProtectedRoute>
            } 
        />
        <Route 
          path="/analise-financeira" 
          element={
            <ProtectedRoute requireAuth={true}>
              <FinancialAnalysisPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/projecao" 
          element={
            <ProtectedRoute requireAuth={true}>
              <ProjectedBalancePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/transactions" 
          element={
            <ProtectedRoute requireAuth={true}>
              <Transactions />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/bills" 
          element={
            <ProtectedRoute requireAuth={true}>
              <BillsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/add-bill" 
          element={
            <ProtectedRoute requireAuth={true}>
              <AddBillPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/charts" 
          element={
            <ProtectedRoute requireAuth={true}>
              <ChartsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/export" 
          element={
            <ProtectedRoute requireAuth={true}>
              <ExportReportPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/notifications" 
          element={
            <ProtectedRoute requireAuth={true}>
              <NotificationsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/preferences" 
          element={
            <ProtectedRoute requireAuth={true}>
              <PreferencesPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/security" 
          element={
            <ProtectedRoute requireAuth={true}>
              <SecurityPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/telegram" 
          element={
            <ProtectedRoute requireAuth={true}>
              <TelegramSettingsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute requireAuth={true}>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute requireAuth={true}>
              <SettingsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/recurring" 
          element={
            <ProtectedRoute requireAuth={true}>
              <RecurringTransactionsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/goals" 
          element={
            <ProtectedRoute requireAuth={true}>
              <GoalsPage />
            </ProtectedRoute>
          } 
        />
      </Route>
      
      {/* 404 Route - must be last */}
      <Route path="*" element={<NotFound />} />
    </Routes>
    </Suspense>
  );
};

export default AppRouter;