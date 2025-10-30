import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import AuthLoadingScreen from '@/components/auth/AuthLoadingScreen';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import PersistentLayout from '@/components/layout/PersistentLayout';
import { Capacitor } from '@capacitor/core';

// Importação das páginas
import HomePage from '@/pages/HomePage';
import DemoPage from '@/pages/DemoPage';
import Dashboard from '@/pages/Dashboard';
import FinancialAdvisorPage from '@/pages/FinancialAdvisorPage';
import FinancialAnalysisPage from '@/pages/FinancialAnalysisPage';
import Transactions from '@/pages/Transactions';
import BillsPage from '@/pages/BillsPage';
import AddBillPage from '@/pages/AddBillPage';
import ChartsPage from '@/pages/ChartsPage';
import ExportReportPage from '@/pages/ExportReportPage';
import NotificationsPage from '@/pages/NotificationsPage';
import PreferencesPage from '@/pages/PreferencesPage';
import SecurityPage from '@/pages/SecurityPage';
import TelegramSettingsPage from '@/pages/TelegramSettingsPage';
import LoginPage from '@/pages/Login';
import TermsOfService from '@/pages/TermsPage';
import PrivacyPolicy from '@/pages/PrivacyPage';
import NotFound from '@/pages/NotFound';
import ProfilePage from '@/pages/Profile';
import SettingsPage from '@/pages/SettingsPage';

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
  
  // Se não está autenticado e é web, mostra a DEMO (para Google AdSense)
  return <Navigate to="/demo" replace />;
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
    <Routes>
      {/* Rotas públicas - redirecionam para dashboard se autenticado */}
      <Route 
        path="/" 
        element={<RootRedirect />}
      />
      <Route 
        path="/demo" 
        element={<DemoPage />}
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
      <Route path="*" element={<NotFound />} />

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
      </Route>
    </Routes>
  );
};

export default AppRouter;
