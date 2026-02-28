from pathlib import Path

v = Path(r'C:\Users\Editora Vélos\Stater\src\components\voice\VoiceRecorderFixed.tsx')
vt = v.read_text(encoding='utf-8')

old_indicator = """        {/* Indicador de tempo de grava\u00e7\u00e3o */}
        {audioState.isRecording && (
          <div style={{
            position: 'absolute',
            top: '-35px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(239, 68, 68, 0.9)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            \U0001F534 {formatTime(audioState.recordingTime)}
          </div>
        )}"""

new_indicator = """        {/* Indicador de tempo de grava\u00e7\u00e3o */}
        {audioState.isRecording && (
          <div style={{
            position: 'absolute',
            top: '-44px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
            padding: '6px 14px',
            borderRadius: '18px',
            fontSize: '13px',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            minWidth: '75px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <span style={{ marginRight: '6px', display: 'inline-block', animation: 'blink 1s infinite' }}>\u25CF</span>
            {formatTime(audioState.recordingTime)}
          </div>
        )}"""

if old_indicator in vt:
    vt = vt.replace(old_indicator, new_indicator)
    print('Indicator replaced')
else:
    print('Indicator not found - checking content...')
    # Debug: find around line 313
    lines = vt.split('\n')
    for i, line in enumerate(lines[310:330], start=311):
        print(f'{i}: {line[:60]}')

v.write_text(vt, encoding='utf-8')
