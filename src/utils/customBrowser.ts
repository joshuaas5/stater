import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

/**
 * Configuração otimizada para Custom Chrome Tabs no Android
 * Esta função força o uso de Custom Chrome Tabs internos no app
 */
export const openCustomBrowser = async (url: string): Promise<void> => {
  if (!Capacitor.isNativePlatform()) {
    // Web: usar window.open
    window.open(url, '_blank');
    return;
  }

  console.log('🚀 Abrindo Custom Chrome Tabs com configuração otimizada...');
  
  try {
    await Browser.open({
      url: url,
      
      // ✅ CONFIGURAÇÕES PARA FORÇAR CUSTOM CHROME TABS
      windowName: '_self',              // Força abertura no contexto do app
      presentationStyle: 'fullscreen',  // Tela cheia sem barra de navegação externa
      
      // ✅ APARÊNCIA INTEGRADA
      toolbarColor: '#020617'           // Cor da barra superior integrada ao app
    });
    
    console.log('✅ Custom Chrome Tabs aberto com sucesso');
  } catch (error) {
    console.error('❌ Erro ao abrir Custom Chrome Tabs:', error);
    
    // Fallback: tentar configuração alternativa
    console.log('🔄 Tentando configuração alternativa...');
    await Browser.open({
      url: url,
      toolbarColor: '#020617'
    });
  }
};

/**
 * Configuração específica para OAuth que evita abertura de Chrome externo
 */
export const openOAuthBrowser = async (url: string): Promise<void> => {
  console.log('🔑 Abrindo OAuth com Custom Chrome Tabs otimizado...');
  
  if (Capacitor.isNativePlatform()) {
    // Android: usar Custom Chrome Tabs com configuração específica para OAuth
    await Browser.open({
      url: url,
      presentationStyle: 'fullscreen',
      toolbarColor: '#020617'
    });
  } else {
    // Web: comportamento normal
    window.open(url, '_blank');
  }
};