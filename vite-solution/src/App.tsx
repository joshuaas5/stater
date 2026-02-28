import React, { useEffect } from 'react'
import './App.css'

function App() {
  useEffect(() => {
    // 🔥 ELIMINAÇÃO DINÂMICA DE FAIXA BRANCA
    const killWhiteBar = () => {
      // Forçar background azul em tudo
      document.documentElement.style.backgroundColor = '#020617'
      document.body.style.backgroundColor = '#020617'
      
      // Forçar theme-color se ainda não foi aplicado
      let metaTheme = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement
      if (!metaTheme) {
        metaTheme = document.createElement('meta')
        metaTheme.name = 'theme-color'
        document.head.appendChild(metaTheme)
      }
      metaTheme.content = '#020617'
      
      // 📱 iOS Status Bar Override
      let metaStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]') as HTMLMetaElement
      if (!metaStatusBar) {
        metaStatusBar = document.createElement('meta')
        metaStatusBar.name = 'apple-mobile-web-app-status-bar-style'
        document.head.appendChild(metaStatusBar)
      }
      metaStatusBar.content = 'black-translucent'
      
      console.log('🔥 Faixa branca eliminada!')
    }
    
    // Executar múltiplas vezes para garantir
    killWhiteBar()
    setTimeout(killWhiteBar, 100)
    setTimeout(killWhiteBar, 500)
    setTimeout(killWhiteBar, 1000)
    
    // Observar mudanças e reexecutar
    const observer = new MutationObserver(killWhiteBar)
    observer.observe(document.head, { childList: true, subtree: true })
    
    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen-safe bg-stater-blue text-white">
      {/* 🔝 HEADER COM SAFE AREA */}
      <header className="pt-safe px-safe bg-stater-blue">
        <div className="flex items-center justify-between h-16">
          <h1 className="text-xl font-bold">Stater</h1>
          <button className="p-2 rounded-lg bg-white/10">
            Menu
          </button>
        </div>
      </header>

      {/* 📱 MAIN CONTENT */}
      <main className="flex-1 px-safe pb-safe bg-stater-blue">
        <div className="py-6 space-y-6">
          <div className="bg-white/10 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Dashboard</h2>
            <p className="text-white/80">
              Bem-vindo ao app Stater! A faixa branca foi eliminada com sucesso.
            </p>
          </div>
          
          <div className="bg-white/10 rounded-xl p-6">
            <h3 className="font-medium mb-2">Análise Financeira</h3>
            <div className="space-y-2">
              <div className="bg-white/5 rounded-lg p-3">
                <span className="text-sm text-white/70">Receitas</span>
                <p className="text-lg font-semibold">R$ 5.230,00</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <span className="text-sm text-white/70">Despesas</span>
                <p className="text-lg font-semibold">R$ 2.140,00</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-xl p-6">
            <h3 className="font-medium mb-2">Configurações</h3>
            <p className="text-white/80 text-sm">
              Todas as configurações do aplicativo.
            </p>
          </div>
        </div>
      </main>

      {/* 🔻 NAVBAR COM SAFE AREA */}
      <nav className="fixed bottom-0 left-0 right-0 bg-stater-blue/95 backdrop-blur-lg border-t border-white/10">
        <div className="pb-safe px-safe">
          <div className="flex justify-around py-2">
            <button className="flex flex-col items-center py-2 px-4 text-white">
              <div className="w-6 h-6 bg-white/20 rounded mb-1"></div>
              <span className="text-xs">Início</span>
            </button>
            <button className="flex flex-col items-center py-2 px-4 text-white/60">
              <div className="w-6 h-6 bg-white/10 rounded mb-1"></div>
              <span className="text-xs">Análise</span>
            </button>
            <button className="flex flex-col items-center py-2 px-4 text-white/60">
              <div className="w-6 h-6 bg-white/10 rounded mb-1"></div>
              <span className="text-xs">Config</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  )
}

export default App
