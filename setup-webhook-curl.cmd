@echo off
echo Configurando webhook do Telegram via CURL...
echo.

if "%TELEGRAM_BOT_TOKEN%"=="" (
  echo ERRO: Defina TELEGRAM_BOT_TOKEN antes de executar este script.
  echo Exemplo: set TELEGRAM_BOT_TOKEN=123456789:ABCDEF...
  exit /b 1
)

REM Configurar o webhook
curl -X POST "https://api.telegram.org/bot%TELEGRAM_BOT_TOKEN%/setWebhook" ^
     -H "Content-Type: application/json" ^
     -d "{\"url\":\"https://stater.app/api/telegram-webhook\",\"allowed_updates\":[\"message\"],\"drop_pending_updates\":true}"

echo.
echo Comando executado!
echo Verificando status do webhook...
echo.

REM Verificar o webhook
curl -X GET "https://api.telegram.org/bot%TELEGRAM_BOT_TOKEN%/getWebhookInfo"

echo.
echo Concluido! Teste no bot: https://t.me/stater
pause