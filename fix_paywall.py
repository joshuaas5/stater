from pathlib import Path

pm = Path(r'C:\Users\Editora Vélos\Stater\src\components\ui\PaywallModal.tsx')
pmt = pm.read_text(encoding='utf-8')

# Change emoji field to icon field and update triggerMessages
old_trigger = """  const triggerMessages: Record<string, { emoji: string; title: string; desc: string }> = {
    messages: { emoji: '', title: 'Suas mensagens acabaram', desc: 'Voc\u00ea usou suas 5 mensagens di\u00e1rias' },
    ocr: { emoji: '', title: 'Recurso PRO', desc: 'An\u00e1lise de fotos com IA' },
    pdf: { emoji: '', title: 'Recurso PRO', desc: 'Leitura de PDFs e extratos' },
    audio: { emoji: '', title: 'Recurso PRO', desc: 'Comandos por voz' },
    reports: { emoji: '', title: 'Recurso PRO', desc: 'Exporta\u00e7\u00e3o de relat\u00f3rios' },
    manual: { emoji: '', title: 'Seja PRO', desc: 'Desbloqueie todo o potencial' },
    bills: { emoji: '', title: 'Recurso PRO', desc: 'Gest\u00e3o avan\u00e7ada de contas' },
    transactions: { emoji: '', title: 'Recurso PRO', desc: 'Transa\u00e7\u00f5es ilimitadas' },
  };

  const info = triggerMessages[trigger] || triggerMessages.manual;"""

new_trigger = """  const triggerIcons: Record<string, { icon: 'messages' | 'camera' | 'file' | 'mic' | 'chart' | 'sparkles' | 'receipt' | 'card'; title: string; desc: string }> = {
    messages: { icon: 'messages', title: 'Suas mensagens acabaram', desc: 'Voc\u00ea usou suas 5 mensagens di\u00e1rias' },
    ocr: { icon: 'camera', title: 'Recurso PRO', desc: 'An\u00e1lise de fotos com IA' },
    pdf: { icon: 'file', title: 'Recurso PRO', desc: 'Leitura de PDFs e extratos' },
    audio: { icon: 'mic', title: 'Recurso PRO', desc: 'Comandos por voz' },
    reports: { icon: 'chart', title: 'Recurso PRO', desc: 'Exporta\u00e7\u00e3o de relat\u00f3rios' },
    manual: { icon: 'sparkles', title: 'Seja PRO', desc: 'Desbloqueie todo o potencial' },
    bills: { icon: 'receipt', title: 'Recurso PRO', desc: 'Gest\u00e3o avan\u00e7ada de contas' },
    transactions: { icon: 'card', title: 'Recurso PRO', desc: 'Transa\u00e7\u00f5es ilimitadas' },
  };

  const iconMap = {
    messages: <Bot size={48} style={{ color: '#a78bfa' }} />,
    camera: <Camera size={48} style={{ color: '#f472b6' }} />,
    file: <FileText size={48} style={{ color: '#60a5fa' }} />,
    mic: <Sparkles size={48} style={{ color: '#34d399' }} />,
    chart: <TrendingUp size={48} style={{ color: '#fbbf24' }} />,
    sparkles: <Sparkles size={48} style={{ color: '#a78bfa' }} />,
    receipt: <FileText size={48} style={{ color: '#f472b6' }} />,
    card: <CreditCard size={48} style={{ color: '#60a5fa' }} />,
  };

  const info = triggerIcons[trigger] || triggerIcons.manual;"""

if old_trigger in pmt:
    pmt = pmt.replace(old_trigger, new_trigger)
    print('trigger replaced')
else:
    print('trigger not found')

# Replace the emoji display with icon
old_emoji_display = """            {/* Emoji Icon */}
            <div
              style={{
                fontSize: '56px',
                marginBottom: '20px',
                filter: 'drop-shadow(0 0 30px rgba(139, 92, 246, 0.5))',
              }}
            >
              {info.emoji}
            </div>"""

new_icon_display = """            {/* Icon */}
            <div
              style={{
                marginBottom: '20px',
                filter: 'drop-shadow(0 0 30px rgba(139, 92, 246, 0.5))',
              }}
            >
              {iconMap[info.icon]}
            </div>"""

if old_emoji_display in pmt:
    pmt = pmt.replace(old_emoji_display, new_icon_display)
    print('emoji display replaced')
else:
    print('emoji display not found')

pm.write_text(pmt, encoding='utf-8')
print('PaywallModal updated with Lucide icons')
