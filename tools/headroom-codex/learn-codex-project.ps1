param(
  [string]$HeadroomRoot = "D:\OtherProject\CameraApp\headroom-main",
  [string]$ProjectRoot = "D:\OtherProject\CameraApp\yingyue-cloud-repo",
  [switch]$Apply,
  [switch]$VerbosityOnly
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $HeadroomRoot)) {
  throw "Headroom root not found: $HeadroomRoot"
}
Push-Location $HeadroomRoot
try {
  $args = @("run", "--no-sync", "headroom", "learn", "--agent", "codex", "--project", $ProjectRoot)
  if ($VerbosityOnly) { $args += "--verbosity" }
  if ($Apply) { $args += "--apply" }

  Write-Host "Running Headroom learn..."
  if (-not $Apply) {
    Write-Host "Dry run only. Add -Apply only after reviewing recommendations."
  }
  Write-Host "Command: uv $($args -join ' ')"
  & uv @args
} finally {
  Pop-Location
}
