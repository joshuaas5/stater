$file = "c:\Stater\src\pages\HomePage.tsx"
$content = Get-Content $file -Raw
Write-Host "Tamanho do arquivo: $($content.Length) caracteres"
