import React from 'react'
import { usePWA } from '../hooks/usePWA'

export const PWAStatus: React.FC = () => {
  const { isStandalone, isFullscreen, safeAreaInsets } = usePWA()

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50 backdrop-blur-sm">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isStandalone ? 'bg-green-400' : 'bg-red-400'}`} />
          <span>PWA: {isStandalone ? 'Standalone' : 'Browser'}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isFullscreen ? 'bg-green-400' : 'bg-yellow-400'}`} />
          <span>Fullscreen: {isFullscreen ? 'Yes' : 'No'}</span>
        </div>
        
        <div className="border-t border-white/20 pt-1 mt-1">
          <div className="text-[10px] text-gray-300">Safe Area:</div>
          <div className="grid grid-cols-2 gap-1 text-[10px]">
            <span>T: {safeAreaInsets.top}px</span>
            <span>R: {safeAreaInsets.right}px</span>
            <span>B: {safeAreaInsets.bottom}px</span>
            <span>L: {safeAreaInsets.left}px</span>
          </div>
        </div>
        
        <div className="border-t border-white/20 pt-1 mt-1">
          <div className="text-[10px] text-gray-300">Viewport:</div>
          <div className="text-[10px]">
            {window.innerWidth}x{window.innerHeight}
          </div>
        </div>
      </div>
    </div>
  )
}
