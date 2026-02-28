# VERIFICAR WEBHOOK DO BOT
# Execute estes comandos no PowerShell

# 1. Verificar info do webhook
Invoke-RestMethod -Uri "https://api.telegram.org/botYOUR_TELEGRAM_BOT_TOKEN/getWebhookInfo" -Method Get

# 2. Verificar se bot está funcionando
# Invoke-RestMethod -Uri "https://api.telegram.org/botYOUR_TELEGRAM_BOT_TOKEN/getMe" -Method Get

# 3. Se webhook não estiver configurado, configurar:
# $body = @{
#     url = "https://stater.app/api/telegram-webhook"
#     allowed_updates = @("message")
#     drop_pending_updates = $true
# } | ConvertTo-Json

# Invoke-RestMethod -Uri "https://api.telegram.org/botYOUR_TELEGRAM_BOT_TOKEN/setWebhook" -Method Post -Body $body -ContentType "application/json"
