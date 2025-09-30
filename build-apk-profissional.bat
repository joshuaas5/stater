@echo off
echo ==========================================
echo    BUILD APK ICTUS - VERSÃO PROFISSIONAL
echo ==========================================

REM Definindo variáveis de ambiente
set GRADLE_USER_HOME=C:\Build\.gradle
set TMPDIR=C:\Build\tmp
set GRADLE_OPTS=-Duser.home=C:\Build -Dfile.encoding=UTF-8 -Duser.language=en -Duser.country=US

echo.
echo [INFO] Definindo ambiente limpo...
echo - GRADLE_USER_HOME: %GRADLE_USER_HOME%
echo - TMPDIR: %TMPDIR%
echo - GRADLE_OPTS: %GRADLE_OPTS%

echo.
echo [1/5] Limpando cache anterior...
if exist "C:\Build\.gradle" rmdir /s /q "C:\Build\.gradle"
if exist "C:\Build\tmp" rmdir /s /q "C:\Build\tmp"
mkdir "C:\Build\.gradle" 2>nul
mkdir "C:\Build\tmp" 2>nul

echo.
echo [2/5] Navegando para projeto...
cd /d "C:\Users\Editora Vélos\ICTUS"

echo.
echo [3/5] Buildando projeto web...
call npm run build
if errorlevel 1 (
    echo ERRO: Falha no build web
    pause
    exit /b 1
)

echo.
echo [4/5] Sincronizando com Android...
call npx cap sync android
if errorlevel 1 (
    echo ERRO: Falha na sincronização
    pause
    exit /b 1
)

echo.
echo [5/5] Gerando APK com Android Build Tools...
cd /d "C:\Users\Editora Vélos\ICTUS\android"

REM Tentativa 1: Build direto com app:assembleDebug
echo Tentando build com app:assembleDebug...
call gradlew.bat app:assembleDebug
if errorlevel 0 goto :success

REM Tentativa 2: Build com assembleDebug
echo Tentando build com assembleDebug...
call gradlew.bat assembleDebug
if errorlevel 0 goto :success

REM Tentativa 3: Build clean + assembleDebug
echo Tentando clean + assembleDebug...
call gradlew.bat clean assembleDebug
if errorlevel 0 goto :success

echo.
echo ERRO: Todas as tentativas de build falharam
pause
exit /b 1

:success
echo.
echo ==========================================
echo           BUILD CONCLUÍDO COM SUCESSO!
echo ==========================================
echo.
echo Verificando APK gerado...

REM Procurar por APK em locais possíveis
for /r %%i in (*.apk) do (
    echo ✓ APK encontrado: %%i
    echo   Tamanho: 
    dir "%%i" | find /v "Directory"
)

echo.
echo APK gerado com sucesso para produção!
echo.
pause
