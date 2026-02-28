from pathlib import Path

guard = "    const maxUploadBytes = 6 * 1024 * 1024; // 6MB limite pra evitar OOM no WebView\n    const bodyBytes = JSON.stringify(requestBody).length * 0.75;\n    if (bodyBytes > maxUploadBytes) {\n      setMessages(prev => [...prev, {\n        id: uuidv4(),\n        text: 'Arquivo muito grande (>' + (maxUploadBytes/1024/1024).toFixed(1) + 'MB). Reduza a foto ou escolha outro arquivo.',\n        sender: 'system',\n        timestamp: new Date(),\n        avatarUrl: IA_AVATAR\n      }]);\n      setLoadingState('ai-thinking', false);\n      return;\n    }\n"

p = Path('src/pages/FinancialAdvisorPage.tsx')
t = p.read_text(encoding='utf-8')
positions = []
start = 0
while True:
    idx = t.find(guard, start)
    if idx == -1:
        break
    positions.append(idx)
    start = idx + len(guard)

if len(positions) > 1:
    # keep first, remove others
    keep_end = positions[0] + len(guard)
    suffix = t[keep_end:]
    for _ in positions[1:]:
        suffix = suffix.replace(guard, '', 1)
    t = t[:keep_end] + suffix
    p.write_text(t, encoding='utf-8')
    print('Removed duplicate guards:', len(positions)-1)
else:
    print('No duplicate guards found (count=%d)' % len(positions))
