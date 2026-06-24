param(
  [string]$HeadroomRoot = "D:\OtherProject\CameraApp\headroom-main",
  [string]$ProjectRoot = "D:\OtherProject\CameraApp\yingyue-cloud-repo",
  [int]$Port = 8787,
  [switch]$Memory,
  [switch]$Learn,
  [switch]$CodeGraph
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $HeadroomRoot)) {
  throw "Headroom root not found: $HeadroomRoot"
}
if (-not (Test-Path -LiteralPath $ProjectRoot)) {
  throw "Project root not found: $ProjectRoot"
}
$env:HEADROOM_PROJECT = $ProjectRoot
$env:HEADROOM_WORKSPACE_DIR = Join-Path $ProjectRoot ".headroom"
$env:HEADROOM_OUTPUT_SHAPER = "1"

$existing = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if ($existing) {
  Write-Host "Headroom proxy port already listening: $Port"
  exit 0
}

Push-Location $HeadroomRoot
try {
  $proxyArgs = @("run", "--no-sync", "headroom", "proxy", "--port", "$Port", "--no-telemetry")
  if ($Memory -or $Learn) { $proxyArgs += "--memory" }
  if ($Learn) { $proxyArgs += "--learn" }
  if ($CodeGraph) { $proxyArgs += "--code-graph" }

  $logDir = Join-Path $ProjectRoot ".headroom"
  New-Item -ItemType Directory -Force -Path $logDir | Out-Null
  $stdoutPath = Join-Path $logDir "headroom-proxy.out.log"
  $stderrPath = Join-Path $logDir "headroom-proxy.err.log"

  Write-Host "Starting Headroom proxy..."
  Write-Host "Command: uv $($proxyArgs -join ' ')"
  $process = Start-Process -FilePath "uv" -ArgumentList $proxyArgs -WorkingDirectory $HeadroomRoot -WindowStyle Hidden -RedirectStandardOutput $stdoutPath -RedirectStandardError $stderrPath -PassThru

  for ($i = 0; $i -lt 30; $i += 1) {
    Start-Sleep -Seconds 1
    $listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    if ($listener) {
      Write-Host "Headroom proxy started: http://127.0.0.1:$Port pid=$($process.Id)"
      exit 0
    }
    if ($process.HasExited) {
      Write-Host "Headroom proxy exited early with code $($process.ExitCode)"
      if (Test-Path -LiteralPath $stderrPath) { Get-Content -LiteralPath $stderrPath -Tail 80 }
      exit $process.ExitCode
    }
  }

  Write-Host "Headroom proxy did not become ready within 30 seconds."
  if (Test-Path -LiteralPath $stderrPath) { Get-Content -LiteralPath $stderrPath -Tail 80 }
  exit 1
} finally {
  Pop-Location
}
