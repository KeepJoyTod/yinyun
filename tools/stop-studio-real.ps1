[CmdletBinding()]
param(
    [string]$RepoRoot = '',
    [switch]$StopDataServices
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

if ([string]::IsNullOrWhiteSpace($RepoRoot)) {
    $scriptRoot = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
    $RepoRoot = Join-Path $scriptRoot '..'
}
$RepoRoot = (Resolve-Path -LiteralPath $RepoRoot).Path
$LogRoot = Join-Path $RepoRoot 'logs\local-real'
$PidRoot = Join-Path $LogRoot 'pids'
$BackendPort = 8080
$FrontendPort = 5190
$PostgresContainer = 'yy-cloud-postgres-dev'
$RedisContainer = 'yy-cloud-redis-dev'

function Write-Step {
    param([string]$Message)
    Write-Host "[stop] $Message"
}

function Get-ProcessCommandLine {
    param([int]$ProcessId)
    $proc = Get-CimInstance Win32_Process -Filter "ProcessId=$ProcessId" -ErrorAction SilentlyContinue
    if ($proc) {
        return [string]$proc.CommandLine
    }
    return ''
}

function Test-ProjectProcess {
    param([int]$ProcessId)
    $cmd = Get-ProcessCommandLine -ProcessId $ProcessId
    if ([string]::IsNullOrWhiteSpace($cmd)) {
        return $false
    }
    $lower = $cmd.ToLowerInvariant()
    $root = $RepoRoot.ToLowerInvariant()
    return $lower.Contains($root) -or
        $lower.Contains('ruoyi-admin\target\ruoyi-admin.jar') -or
        $lower.Contains('studio-workbench') -or
        $lower.Contains('vite --host 127.0.0.1 --port 5190')
}

function Stop-ProjectPid {
    param(
        [int]$ProcessId,
        [string]$Reason
    )
    if ($ProcessId -le 0) {
        return
    }
    $proc = Get-Process -Id $ProcessId -ErrorAction SilentlyContinue
    if (-not $proc) {
        return
    }
    if (-not (Test-ProjectProcess -ProcessId $ProcessId)) {
        Write-Step "Skip pid $ProcessId; it does not look like this project ($Reason)."
        return
    }
    Write-Step "Stopping pid $ProcessId ($($proc.ProcessName)) from $Reason."
    Stop-Process -Id $ProcessId -Force -ErrorAction SilentlyContinue
}

function Stop-PidFile {
    param([string]$Name)
    $path = Join-Path $PidRoot $Name
    if (-not (Test-Path -LiteralPath $path)) {
        return
    }
    $raw = (Get-Content -LiteralPath $path -ErrorAction SilentlyContinue | Select-Object -First 1)
    [int]$pidValue = 0
    if ([int]::TryParse([string]$raw, [ref]$pidValue)) {
        Stop-ProjectPid -ProcessId $pidValue -Reason $Name
    }
    Remove-Item -LiteralPath $path -ErrorAction SilentlyContinue
}

function Stop-PortOwner {
    param([int]$Port)
    $owners = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
        Where-Object { $_.LocalPort -eq $Port } |
        Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($owner in $owners) {
        Stop-ProjectPid -ProcessId ([int]$owner) -Reason "port $Port"
    }
}

Stop-PidFile 'frontend.pid'
Stop-PidFile 'backend.pid'
Stop-PortOwner -Port $FrontendPort
Stop-PortOwner -Port $BackendPort

if ($StopDataServices) {
    if (Get-Command docker -ErrorAction SilentlyContinue) {
        foreach ($container in @($RedisContainer, $PostgresContainer)) {
            $names = docker ps --format '{{.Names}}' 2>$null
            if ($names -contains $container) {
                Write-Step "Stopping Docker container $container."
                docker stop $container | Out-Null
            }
        }
    }
}

Write-Step 'Done.'
