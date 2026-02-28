# Script para monitorar o build do APK
Write-Host "=== MONITORAMENTO DO BUILD APK ===" -ForegroundColor Green
Write-Host "Iniciando monitoramento..." -ForegroundColor Yellow

$androidPath = "C:\Users\Editora Vélos\ICTUS\android"
$apkPath = "$androidPath\app\build\outputs\apk\debug"

# Verificar se o diretório android existe
if (-not (Test-Path $androidPath)) {
    Write-Host "ERRO: Diretório android não encontrado!" -ForegroundColor Red
    exit 1
}

Write-Host "Diretório android encontrado: $androidPath" -ForegroundColor Green

# Verificar se gradlew.bat existe
$gradlewPath = "$androidPath\gradlew.bat"
if (-not (Test-Path $gradlewPath)) {
    Write-Host "ERRO: gradlew.bat não encontrado!" -ForegroundColor Red
    exit 1
}

Write-Host "gradlew.bat encontrado: $gradlewPath" -ForegroundColor Green

# Verificar processos Java em execução
$javaProcesses = Get-Process -Name "java" -ErrorAction SilentlyContinue
if ($javaProcesses) {
    Write-Host "Processos Java em execução: $($javaProcesses.Count)" -ForegroundColor Yellow
    foreach ($process in $javaProcesses) {
        Write-Host "  - PID: $($process.Id), CPU: $($process.CPU)" -ForegroundColor Gray
    }
} else {
    Write-Host "Nenhum processo Java em execução" -ForegroundColor Yellow
}

# Verificar se APK já existe
if (Test-Path "$apkPath\*.apk") {
    Write-Host "APK encontrado!" -ForegroundColor Green
    Get-ChildItem "$apkPath\*.apk" | ForEach-Object {
        Write-Host "  - $($_.Name) ($([math]::Round($_.Length/1MB, 2)) MB)" -ForegroundColor Green
    }
} else {
    Write-Host "APK ainda não gerado" -ForegroundColor Yellow
    
    # Verificar se o diretório de build existe
    if (Test-Path "$androidPath\app\build") {
        Write-Host "Diretório de build existe - build em progresso" -ForegroundColor Yellow
        
        # Listar conteúdo do build
        $buildFiles = Get-ChildItem "$androidPath\app\build" -Recurse -File | Select-Object -First 10
        Write-Host "Arquivos no build:" -ForegroundColor Gray
        foreach ($file in $buildFiles) {
            Write-Host "  - $($file.FullName)" -ForegroundColor Gray
        }
    } else {
        Write-Host "Diretório de build não existe - build não iniciado" -ForegroundColor Red
    }
}

# Verificar logs do gradle
$gradleLogPath = "$env:USERPROFILE\.gradle\daemon"
if (Test-Path $gradleLogPath) {
    Write-Host "Logs do Gradle encontrados em: $gradleLogPath" -ForegroundColor Yellow
}

Write-Host "=== FIM DO MONITORAMENTO ===" -ForegroundColor Green
