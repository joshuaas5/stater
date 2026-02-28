@echo off
echo ===========================================
echo      CONSTRUINDO APK DO ICTUS
echo ===========================================
echo.

REM Configurar JDK 11
set JAVA_HOME=C:\JDK11\jdk-11.0.25+9
set PATH=C:\JDK11\jdk-11.0.25+9\bin;%PATH%

REM Configurar Android SDK
set ANDROID_SDK_ROOT=C:\Android\Sdk
set ANDROID_HOME=C:\Android\Sdk
set PATH=%ANDROID_SDK_ROOT%\platform-tools;%ANDROID_SDK_ROOT%\tools;%PATH%

REM Configurar Gradle
set GRADLE_USER_HOME=C:\G
set ANDROID_USER_HOME=C:\Android\.android

echo Verificando Java...
java -version
echo.

echo Navegando para diretório Android...
cd /d "C:\Users\Editora Vélos\ICTUS\android"

echo Limpando projeto...
call gradlew.bat clean --no-daemon
echo.

echo Construindo APK...
call gradlew.bat assembleDebug --no-daemon

echo.
echo ===========================================
echo APK construído com sucesso!
echo Localização: android\app\build\outputs\apk\debug\
echo ===========================================
pause
