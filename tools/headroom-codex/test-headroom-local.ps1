param(
  [string]$HeadroomRoot = "D:\OtherProject\CameraApp\headroom-main",
  [int]$TimeoutSeconds = 45
)

$ErrorActionPreference = "Stop"

function Test-CommandAvailable {
  param([string]$Name)
  $cmd = Get-Command $Name -ErrorAction SilentlyContinue
  if ($null -eq $cmd) {
    Write-Host "MISSING $Name"
    return $false
  }
  Write-Host "OK $Name -> $($cmd.Source)"
  return $true
}

Write-Host "== Headroom local diagnostics =="
Write-Host "HeadroomRoot: $HeadroomRoot"

$ok = $true
$ok = (Test-CommandAvailable "uv") -and $ok
$ok = (Test-CommandAvailable "codex") -and $ok

if (-not (Test-Path -LiteralPath $HeadroomRoot)) {
  throw "Headroom root not found: $HeadroomRoot"
}

Push-Location $HeadroomRoot
try {
  Write-Host "== Python =="
  uv run --no-sync python --version

  Write-Host "== Import check =="
  $import = Start-Job -ScriptBlock {
    param($Root)
    Set-Location $Root
    uv run --no-sync python -c "import headroom; print('headroom import ok')"
  } -ArgumentList $HeadroomRoot
  if (-not (Wait-Job $import -Timeout $TimeoutSeconds)) {
    Stop-Job $import -Force
    Receive-Job $import -ErrorAction SilentlyContinue | Write-Host
    throw "Timed out importing headroom after ${TimeoutSeconds}s. Run: cd `"$HeadroomRoot`"; uv sync --extra proxy --extra mcp"
  }
  Receive-Job $import

  Write-Host "== CLI help check =="
  $help = Start-Job -ScriptBlock {
    param($Root)
    Set-Location $Root
    uv run --no-sync headroom --help
  } -ArgumentList $HeadroomRoot
  if (-not (Wait-Job $help -Timeout $TimeoutSeconds)) {
    Stop-Job $help -Force
    Receive-Job $help -ErrorAction SilentlyContinue | Write-Host
    throw "Timed out running headroom CLI help after ${TimeoutSeconds}s."
  }
  Receive-Job $help | Select-Object -First 40

  Write-Host "headroom local diagnostics: PASS"
} finally {
  Pop-Location
}
