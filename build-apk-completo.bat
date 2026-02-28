@echo off
echo ========================================
echo    BUILD APK ICTUS - PROCESSO COMPLETO
echo ========================================

cd /d "C:\Users\Editora Vélos\ICTUS"

echo.
echo [1/4] Buildando projeto web...
call npm run build
if errorlevel 1 (
    echo ERRO: Falha no build do projeto web
    pause
    exit /b 1
)

echo.
echo [2/4] Sincronizando com Android...
call npx cap sync android
if errorlevel 1 (
    echo ERRO: Falha na sincronização
    pause
    exit /b 1
)

echo.
echo [3/4] Navegando para diretório Android...
cd /d "C:\Users\Editora Vélos\ICTUS\android"
if errorlevel 1 (
    echo ERRO: Falha ao acessar diretório android
    pause
    exit /b 1
)

echo.
echo [4/4] Gerando APK...
call gradlew.bat assembleDebug
if errorlevel 1 (
    echo ERRO: Falha na geração do APK
    pause
    exit /b 1
)

echo.
echo ========================================
echo           BUILD CONCLUÍDO!
echo ========================================
echo.
echo Verificando APK gerado...
if exist "app\build\outputs\apk\debug\app-debug.apk" (
    echo ✓ APK encontrado: app\build\outputs\apk\debug\app-debug.apk
    dir "app\build\outputs\apk\debug\app-debug.apk"
) else (
    echo ✗ APK não encontrado!
)

echo.
pause
