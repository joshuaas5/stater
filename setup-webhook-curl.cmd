@echo off
echo 🤖 Configurando webhook do Telegram via CURL...
echo.

REM Configurar o webhook
curl -X POST "https://api.telegram.org/bot7971646954:AAHpeNAzvg3kq7A1uER58XRms94sTjWZy5g/setWebhook" ^
     -H "Content-Type: application/json" ^
     -d "{\"url\":\"https://stater.app/api/telegram-webhook\",\"allowed_updates\":[\"message\"],\"drop_pending_updates\":true}"

echo.
echo.
echo ✅ Comando executado!
echo 📋 Verificando status do webhook...
echo.

REM Verificar o webhook
curl -X GET "https://api.telegram.org/bot7971646954:AAHpeNAzvg3kq7A1uER58XRms94sTjWZy5g/getWebhookInfo"

echo.
echo.
echo 🎉 Concluído! Teste no bot: https://t.me/stater
pause
