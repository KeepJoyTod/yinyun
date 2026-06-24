param(
  [string]$HeadroomRoot = "D:\OtherProject\CameraApp\headroom-main",
  [string]$SessionsRoot = "$env:USERPROFILE\.codex\sessions",
  [switch]$Json
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $HeadroomRoot)) {
  throw "Headroom root not found: $HeadroomRoot"
}
if (-not (Test-Path -LiteralPath $SessionsRoot)) {
  throw "Codex sessions root not found: $SessionsRoot"
}
Push-Location $HeadroomRoot
try {
  $args = @("run", "--no-sync", "headroom", "audit-reads", "--codex", "--path", $SessionsRoot)
  if ($Json) { $args += @("--format", "json") }

  Write-Host "Auditing Codex read patterns..."
  Write-Host "Command: uv $($args -join ' ')"
  & uv @args
} finally {
  Pop-Location
}
