# ICTUS APK Professional Build Script
# PowerShell Version

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "    ICTUS - Professional APK Build Process     " -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan

# Set environment for safe build
$env:GRADLE_USER_HOME = "C:\TEMP\SafeGradle"
$env:GRADLE_OPTS = "-Xmx3g -XX:MaxMetaspaceSize=512m -Dfile.encoding=UTF-8"

Write-Host "Cleaning cache directory..." -ForegroundColor Yellow
Remove-Item -Recurse -Force "C:\TEMP\SafeGradle" -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path "C:\TEMP\SafeGradle" | Out-Null

Write-Host "Navigating to Android project directory..." -ForegroundColor Yellow
Set-Location "C:\Users\Editora Vélos\ICTUS\android"

Write-Host "Current location: $(Get-Location)" -ForegroundColor White
Write-Host "Using Gradle cache: $env:GRADLE_USER_HOME" -ForegroundColor White

Write-Host "`n=== Step 1: Cleaning Project ===" -ForegroundColor Magenta
try {
    & .\gradlew.bat clean --no-daemon --no-parallel --max-workers=1 --no-build-cache
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Clean completed successfully" -ForegroundColor Green
        
        Write-Host "`n=== Step 2: Building Debug APK ===" -ForegroundColor Magenta
        & .\gradlew.bat assembleDebug --no-daemon --no-parallel --max-workers=1 --no-build-cache
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n================================================" -ForegroundColor Green
            Write-Host "         🎉 APK BUILD SUCCESSFUL! 🎉           " -ForegroundColor Green
            Write-Host "================================================" -ForegroundColor Green
            
            Write-Host "`nLocating APK files..." -ForegroundColor Yellow
            $apkFiles = Get-ChildItem -Path "app\build\outputs\apk\debug" -Filter "*.apk" -Recurse
            
            if ($apkFiles) {
                Write-Host "`n📱 APK FILES READY:" -ForegroundColor Cyan
                foreach ($apk in $apkFiles) {
                    Write-Host "   📦 $($apk.FullName)" -ForegroundColor White
                    $size = [math]::Round($apk.Length / 1MB, 2)
                    Write-Host "      Size: $size MB" -ForegroundColor Gray
                }
                Write-Host "`n✅ APK ready for professional deployment!" -ForegroundColor Green
            } else {
                Write-Host "⚠️  APK files not found in expected location" -ForegroundColor Yellow
            }
        } else {
            Write-Host "`n❌ APK build failed" -ForegroundColor Red
        }
    } else {
        Write-Host "`n❌ Clean failed" -ForegroundColor Red
    }
} catch {
    Write-Host "`n❌ Build process failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nPress any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
