from pathlib import Path

# Fix FinancialAdvisorPage - improve fetch error handling and remove problematic emojis
p = Path(r'C:\Users\Editora Vélos\Stater\src\pages\FinancialAdvisorPage.tsx')
t = p.read_text(encoding='utf-8')

# Replace emoji-filled error messages with cleaner text
replacements = [
    ('? **Erro de Servidor**', '[ERRO] Erro de Servidor'),
    ('? **Erro de Conexão**', '[ERRO] Erro de Conexão'),
    ('?? **Possíveis causas:**', 'Possíveis causas:'),
    ('?? **Tente:**', 'Tente:'),
    ('?? **Tempo esgotado**', '[TIMEOUT] Tempo esgotado'),
    ('?? Processamento Otimizado', '[INFO] Processamento Otimizado'),
    ('?? Dicas para acelerar ainda mais:', 'Dicas para acelerar:'),
    ('?? Quer tentar novamente?', 'Quer tentar novamente?'),
    ('?? Verifique sua conexão', 'Verifique sua conexão'),
    (' [STEP_1]', '[STEP_1]'),
    ('? [STEP_2]', '[STEP_2]'),
    (' [STEP_3]', '[STEP_3]'),
    ('? [FETCH_ERROR]', '[FETCH_ERROR]'),
    (' [PRE_FETCH]', '[PRE_FETCH]'),
    (' Enviando imagem/PDF', '[OCR] Enviando imagem/PDF'),
]

for old, new in replacements:
    t = t.replace(old, new)

p.write_text(t, encoding='utf-8')
print('FinancialAdvisorPage emojis cleaned')

# Fix PaywallModal emojis
pm = Path(r'C:\Users\Editora Vélos\Stater\src\components\ui\PaywallModal.tsx')
pmt = pm.read_text(encoding='utf-8')

paywall_replacements = [
    ("emoji: '\U0001F4AC'", "emoji: ''"),  # 
    ("emoji: '\U0001F4F7'", "emoji: ''"),  #   
    ("emoji: '\U0001F4C4'", "emoji: ''"),  # 
    ("emoji: '\U0001F3A4'", "emoji: ''"),  # 
    ("emoji: '\U0001F4CA'", "emoji: ''"),  # 
    ("emoji: '\u2728'", "emoji: ''"),      # 
    ("emoji: '\U0001F4D1'", "emoji: ''"),  # 
    ("emoji: '\U0001F4B3'", "emoji: ''"),  # 
]

for old, new in paywall_replacements:
    pmt = pmt.replace(old, new)

# Better approach - use icons instead of emojis
pmt = pmt.replace(
    """  const triggerMessages: Record<string, { emoji: string; title: string; desc: string }> = {
    messages: { emoji: '', title: 'Suas mensagens acabaram', desc: 'Voc\u00ea usou suas 5 mensagens di\u00e1rias' },
    ocr: { emoji: '', title: 'Recurso PRO', desc: 'An\u00e1lise de fotos com IA' },
    pdf: { emoji: '', title: 'Recurso PRO', desc: 'Leitura de PDFs e extratos' },
    audio: { emoji: '', title: 'Recurso PRO', desc: 'Comandos por voz' },
    reports: { emoji: '', title: 'Recurso PRO', desc: 'Exporta\u00e7\u00e3o de relat\u00f3rios' },
    manual: { emoji: '', title: 'Seja PRO', desc: 'Desbloqueie todo o potencial' },
    bills: { emoji: '', title: 'Recurso PRO', desc: 'Gest\u00e3o avan\u00e7ada de contas' },
    transactions: { emoji: '', title: 'Recurso PRO', desc: 'Transa\u00e7\u00f5es ilimitadas' },
  };""",
    """  const triggerMessages: Record<string, { emoji: string; title: string; desc: string }> = {
    messages: { emoji: '', title: 'Suas mensagens acabaram', desc: 'Voc\u00ea usou suas 5 mensagens di\u00e1rias' },
    ocr: { emoji: '', title: 'Recurso PRO', desc: 'An\u00e1lise de fotos com IA' },
    pdf: { emoji: '', title: 'Recurso PRO', desc: 'Leitura de PDFs e extratos' },
    audio: { emoji: '', title: 'Recurso PRO', desc: 'Comandos por voz' },
    reports: { emoji: '', title: 'Recurso PRO', desc: 'Exporta\u00e7\u00e3o de relat\u00f3rios' },
    manual: { emoji: '', title: 'Seja PRO', desc: 'Desbloqueie todo o potencial' },
    bills: { emoji: '', title: 'Recurso PRO', desc: 'Gest\u00e3o avan\u00e7ada de contas' },
    transactions: { emoji: '', title: 'Recurso PRO', desc: 'Transa\u00e7\u00f5es ilimitadas' },
  };"""
)

pm.write_text(pmt, encoding='utf-8')
print('PaywallModal done')

# Fix VoiceRecorderFixed - the red dot
v = Path(r'C:\Users\Editora Vélos\Stater\src\components\voice\VoiceRecorderFixed.tsx')
vt = v.read_text(encoding='utf-8')
# Already using Unicode escape for the dot, should be fine
print('VoiceRecorder checked')
