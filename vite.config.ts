import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      external: ["@capacitor/local-notifications"],
      output: {
        manualChunks: {
          // Vendor chunks - major libraries
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select', '@radix-ui/react-toast'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-charts': ['recharts', 'd3-scale', 'd3-array'],
          'vendor-form': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'vendor-utils': ['date-fns', 'lodash', 'clsx', 'tailwind-merge'],
          
          // Feature chunks - group related pages (optimized)
          'pages-auth': [
            './src/pages/Login.tsx', 
            './src/pages/ResetPasswordPage.tsx'
          ],
          'pages-settings': [
            './src/pages/PreferencesPage.tsx',
            './src/pages/SecurityPage.tsx', 
            './src/pages/SettingsPageNew.tsx',
            './src/pages/TelegramSettingsPage.tsx'
          ],
          'pages-financial': [
            './src/pages/Dashboard.tsx',
            './src/pages/BillsPage.tsx',
            './src/pages/AddBillPage.tsx',
            './src/pages/Transactions.tsx',
            './src/pages/RecurringTransactionsPage.tsx'
          ],
          'pages-advisor': [
            './src/pages/FinancialAdvisorPage.tsx'
          ],
          'pages-analysis': [
            './src/pages/FinancialAnalysisPage.tsx',
            './src/pages/RecommendationsPage.tsx'
          ],
          'pages-reports': [
            './src/pages/ExportReportPage.tsx'
          ],
          'pages-static': [
            './src/pages/PrivacyPage.tsx',
            './src/pages/TermsPage.tsx',
            './src/pages/NotFound.tsx'
          ]
        }
      }
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 600,
    // Enable source maps for production debugging (optional)
    sourcemap: false,
    // Minify for smaller bundles using esbuild (faster and no extra dependency)
    minify: 'esbuild' as const,
    target: 'esnext'
  }
}));
