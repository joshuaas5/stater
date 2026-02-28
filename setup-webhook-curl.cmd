@echo off
echo 🤖 Configurando webhook do Telegram via CURL...
echo.

REM Configurar o webhook
curl -X POST "https://api.telegram.org/botYOUR_TELEGRAM_BOT_TOKEN/setWebhook" ^
     -H "Content-Type: application/json" ^
     -d "{\"url\":\"https://stater.app/api/telegram-webhook\",\"allowed_updates\":[\"message\"],\"drop_pending_updates\":true}"

echo.
echo.
echo ✅ Comando executado!
echo 📋 Verificando status do webhook...
echo.

REM Verificar o webhook
curl -X GET "https://api.telegram.org/botYOUR_TELEGRAM_BOT_TOKEN/getWebhookInfo"

echo.
echo.
echo 🎉 Concluído! Teste no bot: https://t.me/stater
pause
