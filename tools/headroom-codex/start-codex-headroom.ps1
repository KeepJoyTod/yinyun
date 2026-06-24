param(
  [string]$HeadroomRoot = "D:\OtherProject\CameraApp\headroom-main",
  [string]$ProjectRoot = "D:\OtherProject\CameraApp\yingyue-cloud-repo",
  [int]$Port = 8787,
  [switch]$NoCodeGraph,
  [switch]$NoLearn,
  [switch]$NoMemory,
  [string]$Prompt = ""
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $HeadroomRoot)) {
  throw "Headroom root not found: $HeadroomRoot"
}
if (-not (Test-Path -LiteralPath $ProjectRoot)) {
  throw "Project root not found: $ProjectRoot"
}
$env:HEADROOM_PROJECT = $ProjectRoot
$env:HEADROOM_OUTPUT_SHAPER = "1"
$env:HEADROOM_WORKSPACE_DIR = Join-Path $ProjectRoot ".headroom"

Push-Location $HeadroomRoot
try {
  $args = @("run", "--no-sync", "headroom", "wrap", "codex", "--port", "$Port")
  if (-not $NoMemory) { $args += "--memory" }
  if (-not $NoLearn) { $args += "--learn" }
  if (-not $NoCodeGraph) { $args += "--code-graph" }
  $args += "--"
  if ($Prompt.Trim()) { $args += $Prompt }

  Write-Host "Starting Codex through Headroom..."
  Write-Host "ProjectRoot: $ProjectRoot"
  Write-Host "HeadroomRoot: $HeadroomRoot"
  Write-Host "Port: $Port"
  Write-Host "Command: uv $($args -join ' ')"
  & uv @args
} finally {
  Pop-Location
}
