import { lazy, Suspense } from "react";
import { RouteObject } from "react-router-dom";
import { LoadingFallback } from "@/components/ui/loading-fallback";
import PrivateRoute from "@/components/auth/PrivateRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import OnboardingWrapper from "@/components/onboarding/OnboardingWrapper";

// Core components that need to load immediately (no lazy loading)
import HomePage from "@/pages/HomePage";
import HomeRedirect from "@/components/auth/HomeRedirect";
import Login from "@/pages/Login";

// Superwall Tester (for development)
import { SuperwallTester } from "@/components/SuperwallTester";

// Lazy loaded pages - optimized loading strategy
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Transactions = lazy(() => import("@/pages/Transactions"));
const Profile = lazy(() => import("@/pages/Profile"));
const BillsPage = lazy(() => import("@/pages/BillsPage"));
const AddBillPage = lazy(() => import("@/pages/AddBillPage"));
const NotificationsPage = lazy(() => import("@/pages/NotificationsPage"));
const PreferencesPage = lazy(() => import("@/pages/PreferencesPage"));
const SecurityPage = lazy(() => import("@/pages/SecurityPage"));
const FinancialAdvisorPage = lazy(() => import("@/pages/FinancialAdvisorPage").then(module => ({ default: module.FinancialAdvisorPage })));
const RecommendationsPage = lazy(() => import("@/pages/RecommendationsPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPageNew"));
const ExportReportPage = lazy(() => import("@/pages/ExportReportPage"));
const FinancialAnalysisPage = lazy(() => import("@/pages/FinancialAnalysisPage"));
const ProjectedBalancePage = lazy(() => import("@/pages/ProjectedBalancePage"));
const RecurringTransactionsPage = lazy(() => import("@/pages/RecurringTransactionsPage"));
const TelegramSettingsPage = lazy(() => import("@/pages/TelegramSettingsPage"));
const PrivacyPage = lazy(() => import("@/pages/PrivacyPage"));
const TermsPage = lazy(() => import("@/pages/TermsPage"));
const SimpleErrorTestPage = lazy(() => import("@/pages/SimpleErrorTestPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const ResetPasswordPage = lazy(() => import("@/pages/ResetPasswordPage"));

// Public SEO pages - Ferramentas
const ToolsHub = lazy(() => import("@/pages/public/ToolsHub"));
const CompoundInterestCalculator = lazy(() => import("@/pages/public/tools/CompoundInterestCalculator"));
const CryptoConverter = lazy(() => import("@/pages/public/tools/CryptoConverter"));
const CDICalculator = lazy(() => import("@/pages/public/tools/CDICalculator"));

// Public SEO pages - Blog
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

// Reusable wrapper for private routes with lazy loading
const LazyPrivateRoute = ({ children }: { children: React.ReactNode }) => (
  <PrivateRoute>
    <ErrorBoundary>
      <OnboardingWrapper>
        <Suspense fallback={<LoadingFallback />}>
          {children}
        </Suspense>
      </OnboardingWrapper>
    </ErrorBoundary>
  </PrivateRoute>
);

// Reusable wrapper for dashboard routes (with onboarding) - mantem por compatibilidade
const LazyDashboardRoute = ({ children }: { children: React.ReactNode }) => (
  <PrivateRoute>
    <ErrorBoundary>
      <OnboardingWrapper>
        <Suspense fallback={<LoadingFallback />}>
          {children}
        </Suspense>
      </OnboardingWrapper>
    </ErrorBoundary>
  </PrivateRoute>
);

// Reusable wrapper for public lazy routes
const LazyPublicRoute = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingFallback />}>
    {children}
  </Suspense>
);

// Route definitions with lazy loading optimization
export const appRoutes: RouteObject[] = [
  // Public routes - immediate loading
  {
    path: "/",
    element: <HomeRedirect />
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/register", 
    element: <Login />
  },
  
  // Public routes - lazy loaded
  {
    path: "/reset-password",
    element: <LazyPublicRoute><ResetPasswordPage /></LazyPublicRoute>
  },
  {
    path: "/privacy",
    element: <LazyPublicRoute><PrivacyPage /></LazyPublicRoute>
  },
  {
    path: "/terms",
    element: <LazyPublicRoute><TermsPage /></LazyPublicRoute>
  },
  {
    path: "/superwall-test",
    element: <SuperwallTester />
  },
  
  // ============ PUBLIC SEO PAGES - FERRAMENTAS ============
  {
    path: "/ferramentas",
    element: <LazyPublicRoute><ToolsHub /></LazyPublicRoute>
  },
  {
    path: "/ferramentas/calculadora-juros-compostos",
    element: <LazyPublicRoute><CompoundInterestCalculator /></LazyPublicRoute>
  },
  {
    path: "/ferramentas/conversor-cripto",
    element: <LazyPublicRoute><CryptoConverter /></LazyPublicRoute>
  },
  {
    path: "/ferramentas/calculadora-cdi",
    element: <LazyPublicRoute><CDICalculator /></LazyPublicRoute>
  },
  
  // ============ PUBLIC SEO PAGES - BLOG ============
  {
    path: "/blog",
    element: <LazyPublicRoute><BlogHub /></LazyPublicRoute>
  },
  {
    path: "/blog/como-juntar-dinheiro-rapido",
    element: <LazyPublicRoute><ComoJuntarDinheiroRapido /></LazyPublicRoute>
  },
  {
    path: "/blog/regra-50-30-20",
    element: <LazyPublicRoute><Regra503020 /></LazyPublicRoute>
  },
  {
    path: "/blog/como-sair-das-dividas",
    element: <LazyPublicRoute><ComoSairDasDividas /></LazyPublicRoute>
  },
  {
    path: "/blog/investir-com-pouco-dinheiro",
    element: <LazyPublicRoute><InvestirComPoucoDinheiro /></LazyPublicRoute>
  },
  {
    path: "/blog/reserva-de-emergencia",
    element: <LazyPublicRoute><ReservaDeEmergencia /></LazyPublicRoute>
  },
  {
    path: "/blog/cartao-de-credito-vilao-ou-aliado",
    element: <LazyPublicRoute><CartaoDeCreditoVilaoOuAliado /></LazyPublicRoute>
  },
  {
    path: "/blog/metas-financeiras",
    element: <LazyPublicRoute><MetasFinanceiras /></LazyPublicRoute>
  },
  {
    path: "/blog/educacao-financeira-criancas",
    element: <LazyPublicRoute><EducacaoFinanceiraCriancas /></LazyPublicRoute>
  },
  {
    path: "/blog/cdi-selic-ipca",
    element: <LazyPublicRoute><CdiSelicIpca /></LazyPublicRoute>
  },
  {
    path: "/blog/apps-controle-financeiro",
    element: <LazyPublicRoute><AppsControleFinanceiro /></LazyPublicRoute>
  },
  
  // Main dashboard - special loading with onboarding
  {
    path: "/dashboard",
    element: <LazyDashboardRoute><Dashboard /></LazyDashboardRoute>
  },
  
  // Financial routes - high priority lazy loading
  {
    path: "/transactions",
    element: <LazyPrivateRoute><Transactions /></LazyPrivateRoute>
  },
  {
    path: "/recurring-transactions",
    element: <LazyPrivateRoute><RecurringTransactionsPage /></LazyPrivateRoute>
  },
  {
    path: "/bills",
    element: <LazyPrivateRoute><BillsPage /></LazyPrivateRoute>
  },
  {
    path: "/add-bill",
    element: <LazyPrivateRoute><AddBillPage /></LazyPrivateRoute>
  },
  
  // Analysis routes - medium priority
  {
    path: "/analise-financeira",
    element: <LazyPrivateRoute><FinancialAnalysisPage /></LazyPrivateRoute>
  },
  {
    path: "/projecao",
    element: <LazyPrivateRoute><ProjectedBalancePage /></LazyPrivateRoute>
  },
  {
    path: "/financial-advisor",
    element: <LazyPrivateRoute><FinancialAdvisorPage /></LazyPrivateRoute>
  },
  {
    path: "/recomendacoes",
    element: <LazyPrivateRoute><RecommendationsPage /></LazyPrivateRoute>
  },
  {
    path: "/export-report",
    element: <LazyPrivateRoute><ExportReportPage /></LazyPrivateRoute>
  },
  
  // Settings routes - low priority
  {
    path: "/profile",
    element: <LazyPrivateRoute><Profile /></LazyPrivateRoute>
  },
  {
    path: "/preferences",
    element: <LazyPrivateRoute><PreferencesPage /></LazyPrivateRoute>
  },
  {
    path: "/settings",
    element: <LazyPrivateRoute><SettingsPage /></LazyPrivateRoute>
  },
  {
    path: "/settings/telegram",
    element: <LazyPrivateRoute><TelegramSettingsPage /></LazyPrivateRoute>
  },
  {
    path: "/security",
    element: <LazyPrivateRoute><SecurityPage /></LazyPrivateRoute>
  },
  {
    path: "/notifications",
    element: <LazyPrivateRoute><NotificationsPage /></LazyPrivateRoute>
  },
  
  // Development/test routes
  {
    path: "/error-test",
    element: <LazyPrivateRoute><SimpleErrorTestPage /></LazyPrivateRoute>
  },
  
  // 404 - lowest priority
  {
    path: "*",
    element: <LazyPublicRoute><NotFound /></LazyPublicRoute>
  }
];

// Preload critical routes for better UX
export const preloadCriticalRoutes = () => {
  Promise.all([
    import("@/pages/Dashboard"),
    import("@/pages/Transactions"),
    import("@/pages/BillsPage")
  ]).catch(() => {});
};

// Preload route by path - utility function
export const preloadRoute = async (routePath: string) => {
  const routeMap: Record<string, () => Promise<any>> = {
    '/dashboard': () => import("@/pages/Dashboard"),
    '/transactions': () => import("@/pages/Transactions"),
    '/bills': () => import("@/pages/BillsPage"),
    '/financial-advisor': () => import("@/pages/FinancialAdvisorPage"),
    '/analise-financeira': () => import("@/pages/FinancialAnalysisPage"),
    '/settings': () => import("@/pages/SettingsPageNew"),
    '/profile': () => import("@/pages/Profile"),
    '/ferramentas': () => import("@/pages/public/ToolsHub"),
    '/ferramentas/calculadora-juros-compostos': () => import("@/pages/public/tools/CompoundInterestCalculator"),
    '/ferramentas/conversor-cripto': () => import("@/pages/public/tools/CryptoConverter"),
    '/ferramentas/calculadora-cdi': () => import("@/pages/public/tools/CDICalculator"),
    '/blog': () => import("@/pages/public/BlogHub"),
  };
  
  const loader = routeMap[routePath];
  if (loader) {
    try {
      await loader();
    } catch (error) {
      console.warn("Failed to preload route: " + routePath, error);
    }
  }
};