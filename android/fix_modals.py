from pathlib import Path

# 1. Fix PaywallModal - add scroll and safe area
p = Path(r'C:\Users\Editora Vélos\Stater\src\components\ui\PaywallModal.tsx')
t = p.read_text(encoding='utf-8')

# Fix modal container to have scroll and max height
old_modal = """        <div
          style={{
            width: '100%',
            maxWidth: '420px',
            background: 'linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)',
            borderRadius: '32px',
            overflow: 'hidden',
            boxShadow: '0 0 100px rgba(139, 92, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.2)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            position: 'relative',
          }}
        >"""

new_modal = """        <div
          style={{
            width: '100%',
            maxWidth: '420px',
            maxHeight: 'calc(100vh - 40px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))',
            background: 'linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)',
            borderRadius: '24px',
            overflow: 'hidden',
            overflowY: 'auto',
            boxShadow: '0 0 100px rgba(139, 92, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.2)',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            position: 'relative',
          }}
        >"""

if old_modal in t:
    t = t.replace(old_modal, new_modal)
    print('PaywallModal container fixed')
else:
    print('PaywallModal container not found')

# Fix outer wrapper padding for safe area
old_wrapper = """      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
        }}
      >"""

new_wrapper = """      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'calc(20px + env(safe-area-inset-top, 0px)) 16px calc(20px + env(safe-area-inset-bottom, 0px))',
        }}
      >"""

if old_wrapper in t:
    t = t.replace(old_wrapper, new_wrapper)
    print('PaywallModal wrapper padding fixed')
else:
    print('PaywallModal wrapper not found')

p.write_text(t, encoding='utf-8')
print('PaywallModal done')

# 2. Fix VoiceRecorderFixed - adjust recording indicator
v = Path(r'C:\Users\Editora Vélos\Stater\src\components\voice\VoiceRecorderFixed.tsx')
vt = v.read_text(encoding='utf-8')

old_indicator = """        {/* Indicador de tempo de gravação */}
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
             {formatTime(audioState.recordingTime)}
          </div>
        )}"""

new_indicator = """        {/* Indicador de tempo de gravação */}
        {audioState.isRecording && (
          <div style={{
            position: 'absolute',
            top: '-40px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '16px',
            fontSize: '13px',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            minWidth: '70px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
            animation: 'fadeIn 0.3s ease-out, pulseRecord 1.5s ease-in-out infinite'
          }}>
            <span style={{ marginRight: '4px', display: 'inline-block', animation: 'blink 1s infinite' }}></span>
            {formatTime(audioState.recordingTime)}
          </div>
        )}"""

if old_indicator in vt:
    vt = vt.replace(old_indicator, new_indicator)
    print('VoiceRecorder indicator fixed')
else:
    print('VoiceRecorder indicator not found')

# Add pulseRecord animation
old_style = """        <style>{`
          @keyframes pulse {
            0% { transform: scale(1.1); }
            50% { transform: scale(1.15); }
            100% { transform: scale(1.1); }
          }
          
          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0.3; }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateX(-50%) translateY(-5px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
          }
        `}</style>"""

new_style = """        <style>{`
          @keyframes pulse {
            0% { transform: scale(1.1); }
            50% { transform: scale(1.15); }
            100% { transform: scale(1.1); }
          }
          
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateX(-50%) translateY(-5px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
          }
          
          @keyframes pulseRecord {
            0%, 100% { transform: translateX(-50%) scale(1); }
            50% { transform: translateX(-50%) scale(1.05); }
          }
        `}</style>"""

if old_style in vt:
    vt = vt.replace(old_style, new_style)
    print('VoiceRecorder animations fixed')
else:
    print('VoiceRecorder animations not found')

v.write_text(vt, encoding='utf-8')
print('VoiceRecorder done')
