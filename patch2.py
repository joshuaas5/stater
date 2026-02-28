from pathlib import Path
import re

# --- FinancialAdvisorPage adjustments ---
p = Path('src/pages/FinancialAdvisorPage.tsx')
t = p.read_text(encoding='utf-8')

# replace apiUrl block with fixed URL
old_block = """    try {
      // ?? CORREÇÃO CRÍTICA: Detectar Capacitor corretamente
      const isDev = import.meta.env.DEV;
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      // ?? NO CAPACITOR (app mobile): window.location.protocol === 'capacitor:' ou 'ionic:'
      const isCapacitor = window.location.protocol === 'capacitor:' || 
                          window.location.protocol === 'ionic:' ||
                          window.location.hostname === 'localhost' && (window as any).Capacitor;
      
      // ?? REGRA: Se for Capacitor OU dev local, usar URL completa do Vercel
      const apiUrl = (isDev || isLocalhost || isCapacitor) 
        ? 'https://stater.app/api/gemini-ocr'
        : '/api/gemini-ocr';
      
      console.log(' [STEP_1] Iniciando fetch para API OCR');
      console.log(' [STEP_1] URL da API:', apiUrl);
      console.log(' [STEP_1] Detecção de ambiente:');
      console.log('  - import.meta.env.MODE:', import.meta.env.MODE);
      console.log('  - isDev:', isDev);
      console.log('  - isLocalhost:', isLocalhost);
      console.log('  - isCapacitor:', isCapacitor);
      console.log('  - window.location.protocol:', window.location.protocol);
      console.log('  - window.location.hostname:', window.location.hostname);
      console.log('  - Capacitor global:', !!(window as any).Capacitor);
      console.log(' [STEP_1] Request body keys:', Object.keys(requestBody));
      console.log(' [STEP_1] Body size (bytes):', JSON.stringify(requestBody).length);
      
      response = await fetch(apiUrl, {"""
new_block = """    try {
      const apiUrl = 'https://stater.app/api/gemini-ocr';
      
      console.log(' [STEP_1] Iniciando fetch para API OCR');
      console.log(' [STEP_1] URL da API:', apiUrl);
      console.log(' [STEP_1] Request body keys:', Object.keys(requestBody));
      console.log(' [STEP_1] Body size (bytes):', JSON.stringify(requestBody).length);
      
      response = await fetch(apiUrl, {"""
if old_block in t:
    t = t.replace(old_block, new_block)
else:
    print('api block not matched')

# remove duplicate guards (keep first occurrence)
guard = "    const maxUploadBytes = 6 * 1024 * 1024; // 6MB limite pra evitar OOM no WebView\n    const bodyBytes = JSON.stringify(requestBody).length * 0.75;\n    if (bodyBytes > maxUploadBytes) {\n      setMessages(prev => [...prev, {\n        id: uuidv4(),\n        text: 'Arquivo muito grande (>' + (maxUploadBytes/1024/1024).toFixed(1) + 'MB). Reduza a foto ou escolha outro arquivo.',\n        sender: 'system',\n        timestamp: new Date(),\n        avatarUrl: IA_AVATAR\n      }]);\n      setLoadingState('ai-thinking', false);\n      return;\n    }\n\n"
first = t.find(guard)
if first != -1:
    rest = t[first+len(guard):]
    t = t[:first+len(guard)] + rest.replace(guard, '')
else:
    print('guard not found')

p.write_text(t, encoding='utf-8')
print('FinancialAdvisorPage cleaned')

# --- VoiceRecorderFixed catch improvements ---
vp = Path('src/components/voice/VoiceRecorderFixed.tsx')
vt = vp.read_text(encoding='utf-8')
old_catch = """    } catch (error) {\n      console.error('Erro ao iniciar gravação:', error);\n      setError('Permissão do microfone negada ou bloqueada. Libere e tente novamente.');\n    }\n"""
new_catch = """    } catch (error) {\n      console.error('Erro ao iniciar gravação:', error);\n      const name = (error as any)?.name || '';\n      if (name === 'NotAllowedError' || name === 'SecurityError') {\n        setError('Permissão do microfone negada. Libere o microfone e tente novamente.');\n      } else if (name === 'NotFoundError') {\n        setError('Nenhum microfone encontrado.');\n      } else {\n        setError('Erro ao acessar o microfone');\n      }\n    }\n"""
if old_catch in vt:
    vt = vt.replace(old_catch, new_catch)
else:
    print('catch block not matched')
vp.write_text(vt, encoding='utf-8')
print('VoiceRecorder updated')
