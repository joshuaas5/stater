# VERIFICAR WEBHOOK DO BOT
# Execute estes comandos no PowerShell

$botToken = $env:TELEGRAM_BOT_TOKEN
if (-not $botToken) {
  Write-Error "Defina TELEGRAM_BOT_TOKEN no ambiente antes de executar."
  exit 1
}

# 1. Verificar info do webhook
Invoke-RestMethod -Uri "https://api.telegram.org/bot$botToken/getWebhookInfo" -Method Get

# 2. Verificar se bot esta funcionando
# Invoke-RestMethod -Uri "https://api.telegram.org/bot$botToken/getMe" -Method Get

# 3. Se webhook nao estiver configurado, configurar:
# $body = @{
#     url = "https://stater.app/api/telegram-webhook"
#     allowed_updates = @("message")
#     drop_pending_updates = $true
# } | ConvertTo-Json

# Invoke-RestMethod -Uri "https://api.telegram.org/bot$botToken/setWebhook" -Method Post -Body $body -ContentType "application/json"