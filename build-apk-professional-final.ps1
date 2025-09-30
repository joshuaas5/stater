# =========================================
# 🚀 STATER APK BUILDER PROFESSIONAL v2.0
# =========================================
# Script profissional para gerar APK otimizado
# Autor: Sistema automatizado
# Data: $(Get-Date -Format "dd/MM/yyyy HH:mm")

Write-Host "🚀 INICIANDO BUILD PROFISSIONAL DO STATER APK" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Configurações
$APP_NAME = "Stater"
$VERSION = "1.1.0"
$BUILD_DATE = Get-Date -Format "yyyyMMdd_HHmm"
$APK_NAME = "Stater_PROFESSIONAL_v${VERSION}_${BUILD_DATE}.apk"

# Step 1: Limpar ambiente
Write-Host "📁 Step 1: Limpando ambiente..." -ForegroundColor Yellow
Remove-Item -Path "dist" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "android\.gradle" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "android\app\build" -Recurse -Force -ErrorAction SilentlyContinue

# Step 2: Build do projeto web
Write-Host "🔧 Step 2: Building projeto web..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro no build do projeto web!" -ForegroundColor Red
    exit 1
}

# Step 3: Sync Capacitor
Write-Host "📱 Step 3: Sincronizando Capacitor..." -ForegroundColor Yellow
npx cap sync android
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro no sync do Capacitor!" -ForegroundColor Red
    exit 1
}

# Step 4: Build do APK Android
Write-Host "🏗️ Step 4: Building APK Android..." -ForegroundColor Yellow
Set-Location "android"

# Limpar e buildar
.\gradlew clean
.\gradlew assembleRelease --no-daemon --stacktrace

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro no build do APK!" -ForegroundColor Red
    Set-Location ".."
    exit 1
}

Set-Location ".."

# Step 5: Localizar e copiar APK
Write-Host "📦 Step 5: Copiando APK final..." -ForegroundColor Yellow
$APK_SOURCE = "android\app\build\outputs\apk\release\app-release.apk"

if (Test-Path $APK_SOURCE) {
    Copy-Item $APK_SOURCE $APK_NAME
    Write-Host "✅ APK gerado com sucesso: $APK_NAME" -ForegroundColor Green
    
    # Informações do APK
    $APK_SIZE = [math]::Round((Get-Item $APK_NAME).Length / 1MB, 2)
    Write-Host "📊 Tamanho do APK: ${APK_SIZE}MB" -ForegroundColor Cyan
    
    # Verificar assinatura
    Write-Host "🔐 Verificando assinatura..." -ForegroundColor Yellow
    & "java" "-jar" "$env:ANDROID_HOME\build-tools\34.0.0\lib\apksigner.jar" "verify" "--verbose" $APK_NAME
    
} else {
    Write-Host "❌ APK não encontrado em: $APK_SOURCE" -ForegroundColor Red
    Write-Host "🔍 Listando arquivos de output:" -ForegroundColor Yellow
    Get-ChildItem "android\app\build\outputs" -Recurse -Name "*.apk" | ForEach-Object { Write-Host "   - $_" }
    exit 1
}

# Step 6: Relatório final
Write-Host "`n🎉 BUILD CONCLUÍDO COM SUCESSO!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host "📱 App: $APP_NAME" -ForegroundColor White
Write-Host "🏷️ Versão: $VERSION" -ForegroundColor White
Write-Host "📦 APK: $APK_NAME" -ForegroundColor White
Write-Host "💾 Tamanho: ${APK_SIZE}MB" -ForegroundColor White
Write-Host "🕒 Build: $BUILD_DATE" -ForegroundColor White
Write-Host "🔐 Assinado: ✅" -ForegroundColor Green
Write-Host "`n🚀 APK pronto para instalação!" -ForegroundColor Cyan

# Step 7: Abrir pasta do APK
Write-Host "📂 Abrindo pasta do APK..." -ForegroundColor Yellow
Invoke-Item (Get-Location)
