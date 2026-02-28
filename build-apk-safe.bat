@echo off
echo ====================================
echo   ICTUS APK Build Script - Safe Mode
echo ====================================

:: Set environment variables for safe build
set GRADLE_USER_HOME=C:\TEMP\SafeGradle
set GRADLE_OPTS=-Xmx3g -XX:MaxMetaspaceSize=512m -Dfile.encoding=UTF-8
set JAVA_OPTS=-Dfile.encoding=UTF-8

:: Clean and create cache directory
echo Cleaning cache directory...
rmdir /s /q "%GRADLE_USER_HOME%" 2>nul
mkdir "%GRADLE_USER_HOME%" 2>nul

:: Navigate to Android project
cd /d "C:\Users\Editora Vélos\ICTUS\android"

echo Starting APK build...
echo Using cache: %GRADLE_USER_HOME%

:: Attempt 1: Conservative build
echo.
echo === Attempt 1: Conservative Build ===
.\gradlew.bat clean --no-daemon --no-parallel --max-workers=1
if %ERRORLEVEL% EQU 0 (
    .\gradlew.bat assembleDebug --no-daemon --no-parallel --max-workers=1 --offline
    if %ERRORLEVEL% EQU 0 goto SUCCESS
)

:: Attempt 2: Even more conservative
echo.
echo === Attempt 2: Ultra Conservative ===
.\gradlew.bat clean --no-daemon --no-parallel --max-workers=1 --no-build-cache
if %ERRORLEVEL% EQU 0 (
    .\gradlew.bat assembleDebug --no-daemon --no-parallel --max-workers=1 --no-build-cache
    if %ERRORLEVEL% EQU 0 goto SUCCESS
)

:: Attempt 3: With refresh dependencies
echo.
echo === Attempt 3: Fresh Dependencies ===
.\gradlew.bat clean --refresh-dependencies --no-daemon --no-parallel --max-workers=1
if %ERRORLEVEL% EQU 0 (
    .\gradlew.bat assembleDebug --refresh-dependencies --no-daemon --no-parallel --max-workers=1
    if %ERRORLEVEL% EQU 0 goto SUCCESS
)

echo.
echo ====================================
echo   Build failed after all attempts
echo ====================================
goto END

:SUCCESS
echo.
echo ====================================
echo   APK BUILD SUCCESSFUL!
echo ====================================
echo.
echo Locating APK file...
dir "app\build\outputs\apk\debug\*.apk" /b /s
echo.
echo APK ready for deployment!

:END
pause
