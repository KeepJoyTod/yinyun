param(
  [string]$ComposeFile = "docker-compose.prod.yml",
  [string]$OutputDir = "backups",
  [int]$KeepDays = 14
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $OutputDir)) {
  New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupFile = Join-Path $OutputDir "camera_studio_$timestamp.sql"

docker compose -f $ComposeFile exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' | Set-Content -LiteralPath $backupFile -Encoding UTF8

$cutoff = (Get-Date).AddDays(-$KeepDays)
Get-ChildItem -LiteralPath $OutputDir -Filter "camera_studio_*.sql" |
  Where-Object { $_.LastWriteTime -lt $cutoff } |
  Remove-Item -Force

Write-Host "Backup created: $backupFile"
