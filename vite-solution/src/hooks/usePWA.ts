import { useEffect, useState } from 'react'

interface PWAStatus {
  isStandalone: boolean
  isInstallable: boolean
  isFullscreen: boolean
  safeAreaInsets: {
    top: number
    right: number
    bottom: number
    left: number
  }
}

export const usePWA = (): PWAStatus => {
  const [pwaStatus, setPwaStatus] = useState<PWAStatus>({
    isStandalone: false,
    isInstallable: false,
    isFullscreen: false,
    safeAreaInsets: { top: 0, right: 0, bottom: 0, left: 0 }
  })

  useEffect(() => {
    // 📱 Detectar se está rodando como PWA
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      // @ts-ignore
      window.navigator.standalone === true

    // 🎯 Detectar se é instalável
    let deferredPrompt: any = null
    const isInstallable = !!deferredPrompt

    // 🌟 Detectar modo fullscreen
    const isFullscreen = 
      window.matchMedia('(display-mode: fullscreen)').matches

    // 📐 Calcular safe area insets
    const computeStyle = getComputedStyle(document.documentElement)
    const safeAreaInsets = {
      top: parseInt(computeStyle.getPropertyValue('--sat') || '0', 10),
      right: parseInt(computeStyle.getPropertyValue('--sar') || '0', 10),
      bottom: parseInt(computeStyle.getPropertyValue('--sab') || '0', 10),
      left: parseInt(computeStyle.getPropertyValue('--sal') || '0', 10)
    }

    setPwaStatus({
      isStandalone,
      isInstallable,
      isFullscreen,
      safeAreaInsets
    })

    // 🔥 ELIMINAR FAIXA BRANCA DINAMICAMENTE
    const killWhiteBar = () => {
      document.documentElement.style.backgroundColor = '#020617'
      document.body.style.backgroundColor = '#020617'
      
      // Forçar theme-color
      let metaTheme = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement
      if (metaTheme) {
        metaTheme.content = '#020617'
      }
      
      // iOS Status bar
      let metaStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]') as HTMLMetaElement
      if (metaStatusBar) {
        metaStatusBar.content = 'black-translucent'
      }
    }

    // Executar eliminação em intervalos
    killWhiteBar()
    const interval = setInterval(killWhiteBar, 1000)

    // Listener para mudanças de orientação/resize
    const handleResize = () => {
      setTimeout(killWhiteBar, 100)
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)

    // Listener para beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      deferredPrompt = e
      setPwaStatus(prev => ({ ...prev, isInstallable: true }))
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      clearInterval(interval)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  return pwaStatus
}
