# Build Debug Rápido - Com Logs de Debug
Write-Host "=== BUILD DEBUG RÁPIDO ===" -ForegroundColor Green

# Sync apenas os arquivos alterados
Write-Host "1. Sincronizando arquivos..." -ForegroundColor Yellow
npx cap sync android

# Build direto com gradle
Write-Host "2. Compilando APK debug..." -ForegroundColor Yellow
cd android
./gradlew assembleDebug

# Instalar no device
Write-Host "3. Instalando no device..." -ForegroundColor Yellow
adb install -r app/build/outputs/apk/debug/app-debug.apk

Write-Host "=== BUILD CONCLUÍDO ===" -ForegroundColor Green
Write-Host "Use 'adb logcat | findstr STATER' para ver os logs" -ForegroundColor Cyan
