# Script para aplicar as tabelas de analytics no Supabase
Write-Host "Aplicando tabelas de analytics no Supabase..." -ForegroundColor Cyan
Write-Host ""

# Le o arquivo SQL
$sqlFile = "supabase\migrations\create_analytics_tables.sql"
$sql = Get-Content $sqlFile -Raw

# Configuracoes do Supabase
$projectRef = "tmucbwlhkffrhtexmjze"
$supabaseUrl = "https://$projectRef.supabase.co"

# Pega o token de acesso do Supabase CLI (se estiver logado)
Write-Host "Conectando ao Supabase..." -ForegroundColor Yellow

# Tenta usar o npx supabase db execute
try {
    Write-Host "Executando SQL via Supabase CLI..." -ForegroundColor Gray
    
    # Salva o SQL em um arquivo temporário
    $tempSql = "temp_analytics.sql"
    $sql | Out-File -FilePath $tempSql -Encoding UTF8
    
    # Executa via CLI
    $result = npx -y supabase@latest db execute --file $tempSql --password "24102003@Jj" --linked 2>&1
    
    # Remove arquivo temporário
    Remove-Item $tempSql -ErrorAction SilentlyContinue
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "===================================================================" -ForegroundColor Green
        Write-Host "  TABELAS DE ANALYTICS CRIADAS COM SUCESSO!" -ForegroundColor Green
        Write-Host "===================================================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Tabelas criadas:" -ForegroundColor Yellow
        Write-Host "  - analytics_pageviews" -ForegroundColor White
        Write-Host "  - analytics_events" -ForegroundColor White
        Write-Host "  - analytics_users" -ForegroundColor White
        Write-Host ""
        Write-Host "PROXIMO PASSO: Fazer deploy do site" -ForegroundColor Cyan
        Write-Host "   npm run build" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Ver dados em tempo real:" -ForegroundColor Cyan
        Write-Host "   https://supabase.com/dashboard/project/$projectRef/editor" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Queries prontas no arquivo: ANALYTICS_SUPABASE_GUIA.md" -ForegroundColor Gray
        Write-Host ""
    } else {
        throw "Erro ao executar SQL"
    }
} catch {
    Write-Host ""
    Write-Host "Erro ao aplicar via CLI" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "===================================================================" -ForegroundColor Cyan
    Write-Host "  APLICAR MANUALMENTE:" -ForegroundColor Yellow
    Write-Host "===================================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Abra o SQL Editor do Supabase:" -ForegroundColor White
    Write-Host "   https://supabase.com/dashboard/project/$projectRef/editor" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "2. Cole o SQL completo do arquivo:" -ForegroundColor White
    Write-Host "   supabase\migrations\create_analytics_tables.sql" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "3. Clique em RUN (Ctrl+Enter)" -ForegroundColor White
    Write-Host ""
    Write-Host "Erro detalhado:" -ForegroundColor Gray
    Write-Host $result -ForegroundColor Red
    Write-Host ""
}
