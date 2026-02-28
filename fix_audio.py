from pathlib import Path

p = Path(r'C:\Users\Editora Vélos\Stater\android\app\src\main\java\com\timothy\stater\MainActivity.java')
t = p.read_text(encoding='utf-8')

# Add MODIFY_AUDIO_SETTINGS to permissions array
old_perms = '''    private void requestPermissions() {
        String[] permissions = {
            Manifest.permission.RECORD_AUDIO,
            Manifest.permission.CAMERA,
            Manifest.permission.READ_EXTERNAL_STORAGE,
            Manifest.permission.WRITE_EXTERNAL_STORAGE
        };'''

new_perms = '''    private void requestPermissions() {
        String[] permissions = {
            Manifest.permission.RECORD_AUDIO,
            Manifest.permission.MODIFY_AUDIO_SETTINGS,
            Manifest.permission.CAMERA,
            Manifest.permission.READ_EXTERNAL_STORAGE,
            Manifest.permission.WRITE_EXTERNAL_STORAGE
        };'''

if old_perms in t:
    t = t.replace(old_perms, new_perms)
    print('Added MODIFY_AUDIO_SETTINGS to permissions')
else:
    print('Permissions block not found')

# Add AudioManager import if missing
if 'import android.media.AudioManager;' not in t:
    t = t.replace('import android.Manifest;', 'import android.Manifest;\nimport android.media.AudioManager;')
    print('Added AudioManager import')

# Add audio mode setup in onCreate after requestPermissions
old_oncreate_end = '''        requestPermissions();
        handleIntent(getIntent());
    }'''
new_oncreate_end = '''        requestPermissions();
        setupAudioMode();
        handleIntent(getIntent());
    }
    
    private void setupAudioMode() {
        try {
            AudioManager audioManager = (AudioManager) getSystemService(AUDIO_SERVICE);
            if (audioManager != null) {
                audioManager.setMode(AudioManager.MODE_IN_COMMUNICATION);
                android.util.Log.d("STATER", "AudioManager set to MODE_IN_COMMUNICATION");
            }
        } catch (Exception e) {
            android.util.Log.e("STATER", "Failed to setup audio mode: " + e.getMessage());
        }
    }'''

if old_oncreate_end in t:
    t = t.replace(old_oncreate_end, new_oncreate_end)
    print('Added setupAudioMode()')
else:
    print('onCreate block not found for audio setup')

p.write_text(t, encoding='utf-8')
print('MainActivity updated')
