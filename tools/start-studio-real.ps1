[CmdletBinding()]
param(
    [string]$RepoRoot = ''
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

if ([string]::IsNullOrWhiteSpace($RepoRoot)) {
    $scriptRoot = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
    $RepoRoot = Join-Path $scriptRoot '..'
}
$RepoRoot = (Resolve-Path -LiteralPath $RepoRoot).Path
$BackendRoot = Join-Path $RepoRoot 'backend'
$StudioRoot = Join-Path $RepoRoot 'studio-workbench'
$LogRoot = Join-Path $RepoRoot 'logs\local-real'
$PidRoot = Join-Path $LogRoot 'pids'
$BackendJar = Join-Path $BackendRoot 'ruoyi-admin\target\ruoyi-admin.jar'
$BackendOutLog = Join-Path $LogRoot 'backend.out.log'
$BackendErrLog = Join-Path $LogRoot 'backend.err.log'
$FrontendOutLog = Join-Path $LogRoot 'frontend.out.log'
$FrontendErrLog = Join-Path $LogRoot 'frontend.err.log'
$EnvLocalPath = Join-Path $StudioRoot '.env.local'

$PostgresContainer = 'yy-cloud-postgres-dev'
$RedisContainer = 'yy-cloud-redis-dev'
$PostgresPort = 55432
$RedisPort = 56379
$BackendPort = 8080
$FrontendPort = 5190

New-Item -ItemType Directory -Force -Path $LogRoot | Out-Null
New-Item -ItemType Directory -Force -Path $PidRoot | Out-Null

function Write-Step {
    param([string]$Message)
    Write-Host "[start] $Message"
}

function Test-PortListening {
    param([int]$Port)
    $null -ne (Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
        Where-Object { $_.LocalPort -eq $Port } |
        Select-Object -First 1)
}

function Get-PortOwner {
    param([int]$Port)
    Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
        Where-Object { $_.LocalPort -eq $Port } |
        Select-Object -First 1
}

function Wait-Port {
    param(
        [int]$Port,
        [int]$TimeoutSeconds = 90
    )
    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        if (Test-PortListening -Port $Port) {
            return $true
        }
        Start-Sleep -Seconds 2
    }
    return $false
}

function Assert-Command {
    param([string]$Name)
    $cmd = Get-Command $Name -ErrorAction SilentlyContinue
    if (-not $cmd) {
        throw "Command not found in PATH: $Name"
    }
    return $cmd.Source
}

function Test-DockerReady {
    docker version --format '{{.Server.Version}}' 2>$null | Out-Null
    return $LASTEXITCODE -eq 0
}

function Ensure-DockerReady {
    Assert-Command docker | Out-Null
    if (Test-DockerReady) {
        return
    }

    $dockerDesktop = 'C:\Program Files\Docker\Docker\Docker Desktop.exe'
    if (Test-Path -LiteralPath $dockerDesktop) {
        Write-Step 'Starting Docker Desktop...'
        Start-Process -FilePath $dockerDesktop -WindowStyle Hidden
    }

    $deadline = (Get-Date).AddSeconds(150)
    while ((Get-Date) -lt $deadline) {
        if (Test-DockerReady) {
            return
        }
        Start-Sleep -Seconds 3
    }
    throw 'Docker engine is not running. Start Docker Desktop, then run start.bat again.'
}

function Test-ContainerExists {
    param([string]$Name)
    $names = docker ps -a --format '{{.Names}}'
    return $names -contains $Name
}

function Ensure-Postgres {
    Ensure-DockerReady
    if (Test-ContainerExists $PostgresContainer) {
        docker start $PostgresContainer | Out-Null
    } else {
        Write-Step "Creating PostgreSQL container $PostgresContainer on port $PostgresPort..."
        docker run -d --name $PostgresContainer `
            -e POSTGRES_USER=postgres `
            -e POSTGRES_PASSWORD=postgres `
            -e POSTGRES_DB=yingyue_cloud `
            -p "$PostgresPort`:5432" `
            postgres:16-alpine | Out-Null
    }

    if (-not (Wait-Port -Port $PostgresPort -TimeoutSeconds 120)) {
        throw "PostgreSQL did not start on port $PostgresPort."
    }
}

function Ensure-Redis {
    Ensure-DockerReady
    if (Test-ContainerExists $RedisContainer) {
        docker start $RedisContainer | Out-Null
    } else {
        Write-Step "Creating Redis container $RedisContainer on port $RedisPort..."
        docker run -d --name $RedisContainer -p "$RedisPort`:6379" redis:7-alpine redis-server --requirepass redis123 | Out-Null
    }

    if (-not (Wait-Port -Port $RedisPort -TimeoutSeconds 120)) {
        throw "Redis did not start on port $RedisPort."
    }
}

function Get-ContainerEnvValue {
    param(
        [string]$Container,
        [string]$Name,
        [string]$Fallback = ''
    )
    $line = docker inspect $Container --format '{{range .Config.Env}}{{println .}}{{end}}' |
        Where-Object { $_ -like "$Name=*" } |
        Select-Object -First 1
    if (-not $line) {
        return $Fallback
    }
    return [string]($line -replace "^$([regex]::Escape($Name))=", '')
}

function Get-RedisPassword {
    $cmd = docker inspect $RedisContainer --format '{{json .Config.Cmd}}' | ConvertFrom-Json
    for ($i = 0; $i -lt $cmd.Count; $i++) {
        if ($cmd[$i] -eq '--requirepass' -and $i + 1 -lt $cmd.Count) {
            return [string]$cmd[$i + 1]
        }
    }
    return ''
}

function Invoke-PostgresScalar {
    param([string]$Sql)
    $result = docker exec $PostgresContainer psql -U postgres -d yingyue_cloud -tAc $Sql
    if ($LASTEXITCODE -ne 0) {
        throw "PostgreSQL command failed: $Sql"
    }
    return [string]$result
}

function Ensure-YingyueDatabase {
    $deadline = (Get-Date).AddSeconds(90)
    while ((Get-Date) -lt $deadline) {
        try {
            $tableCountText = Invoke-PostgresScalar "select count(*) from information_schema.tables where table_schema='public';"
            $tableCount = [int]$tableCountText.Trim()
            if ($tableCount -gt 0) {
                Write-Step "PostgreSQL ready: yingyue_cloud has $tableCount public tables."
                return
            }
            break
        } catch {
            Start-Sleep -Seconds 2
        }
    }

    Write-Step 'PostgreSQL database is empty; importing base schema and demo data...'
    $sqlRoot = Join-Path $BackendRoot 'script\sql\postgres'
    $files = @(
        'postgres_ry_vue_5.X.sql',
        'postgres_ry_job.sql',
        'postgres_ry_workflow.sql',
        'postgres_yy_cloud.sql',
        'postgres_yy_cloud_codegen.sql',
        'postgres_yy_cloud_demo_data.sql'
    )
    foreach ($file in $files) {
        $path = Join-Path $sqlRoot $file
        if (-not (Test-Path -LiteralPath $path)) {
            throw "SQL file not found: $path"
        }
        Write-Step "Importing $file"
        Get-Content -LiteralPath $path -Raw -Encoding UTF8 |
            docker exec -i $PostgresContainer psql -U postgres -d yingyue_cloud -v ON_ERROR_STOP=1 | Out-Null
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to import SQL file: $file"
        }
    }
}

function Set-EnvLocalValue {
    param(
        [string[]]$Lines,
        [string]$Name,
        [string]$Value
    )
    $found = $false
    $next = foreach ($line in $Lines) {
        if ($line -match "^\s*$([regex]::Escape($Name))=") {
            $found = $true
            "$Name=$Value"
        } else {
            $line
        }
    }
    if (-not $found) {
        $next += "$Name=$Value"
    }
    return $next
}

function Ensure-StudioEnvLocal {
    $lines = @()
    if (Test-Path -LiteralPath $EnvLocalPath) {
        $lines = @(Get-Content -LiteralPath $EnvLocalPath)
    }
    $lines = Set-EnvLocalValue -Lines $lines -Name 'VITE_STUDIO_DEMO' -Value 'false'
    $lines = Set-EnvLocalValue -Lines $lines -Name 'VITE_API_BASE_URL' -Value "http://127.0.0.1:$BackendPort"
    $lines = Set-EnvLocalValue -Lines $lines -Name 'VITE_STUDIO_MIN_STORE_COUNT' -Value '4'
    $lines = Set-EnvLocalValue -Lines $lines -Name 'VITE_STUDIO_LEGACY_AUTO_LOGIN' -Value 'false'
    $lines = Set-EnvLocalValue -Lines $lines -Name 'VITE_STUDIO_TENANT_ID' -Value '000000'
    Set-Content -LiteralPath $EnvLocalPath -Value $lines -Encoding UTF8
    Write-Step 'studio-workbench/.env.local is configured for real API mode.'
}

function Ensure-BackendJar {
    if (Test-Path -LiteralPath $BackendJar) {
        return
    }
    Assert-Command mvn | Out-Null
    Write-Step 'Backend jar not found; building ruoyi-admin...'
    Push-Location $BackendRoot
    try {
        & mvn -pl ruoyi-admin -am -DskipTests package
        if ($LASTEXITCODE -ne 0) {
            throw 'Maven build failed.'
        }
    } finally {
        Pop-Location
    }
}

function Ensure-FrontendDependencies {
    $nodeModules = Join-Path $StudioRoot 'node_modules'
    if (Test-Path -LiteralPath $nodeModules) {
        return
    }
    Assert-Command npm | Out-Null
    Write-Step 'Frontend dependencies not found; running npm ci...'
    & npm --prefix $StudioRoot ci
    if ($LASTEXITCODE -ne 0) {
        throw 'npm ci failed.'
    }
}

function Start-Backend {
    $owner = Get-PortOwner -Port $BackendPort
    if ($owner) {
        Write-Step "Backend already listening on port $BackendPort (pid $($owner.OwningProcess))."
        Set-Content -LiteralPath (Join-Path $PidRoot 'backend.pid') -Value ([string]$owner.OwningProcess) -Encoding ASCII
        return
    }

    Ensure-BackendJar
    Assert-Command java | Out-Null

    $pgUser = Get-ContainerEnvValue -Container $PostgresContainer -Name 'POSTGRES_USER' -Fallback 'postgres'
    $pgPass = Get-ContainerEnvValue -Container $PostgresContainer -Name 'POSTGRES_PASSWORD' -Fallback 'postgres'
    $redisPassword = Get-RedisPassword

    $env:DB_URL = "jdbc:postgresql://127.0.0.1:$PostgresPort/yingyue_cloud?useUnicode=true&characterEncoding=utf8&sslmode=disable&reWriteBatchedInserts=true"
    $env:DB_USERNAME = $pgUser
    $env:DB_PASSWORD = $pgPass
    $env:REDIS_PASSWORD = $redisPassword
    $env:SPRING_DATA_REDIS_HOST = '127.0.0.1'
    $env:SPRING_DATA_REDIS_PORT = [string]$RedisPort
    $env:YY_DOUYIN_LIFE_AUTO_SYNC_ENABLED = 'false'
    $env:YY_DOUYIN_LIFE_RECONCILE_ENABLED = 'false'
    $env:YY_DOUYIN_LIFE_EVENT_INBOX_WORKER_ENABLED = 'false'
    $env:SNAIL_JOB_ENABLED = 'false'
    $env:SPRING_BOOT_ADMIN_CLIENT_ENABLED = 'false'

    Remove-Item -LiteralPath $BackendOutLog, $BackendErrLog -ErrorAction SilentlyContinue
    $process = Start-Process -FilePath (Assert-Command java) `
        -ArgumentList @(
            '-Dfile.encoding=UTF-8',
            '-Dsun.stdout.encoding=UTF-8',
            '-Dsun.stderr.encoding=UTF-8',
            '-jar',
            $BackendJar
        ) `
        -WorkingDirectory $BackendRoot `
        -RedirectStandardOutput $BackendOutLog `
        -RedirectStandardError $BackendErrLog `
        -WindowStyle Hidden `
        -PassThru
    Set-Content -LiteralPath (Join-Path $PidRoot 'backend.pid') -Value ([string]$process.Id) -Encoding ASCII

    if (-not (Wait-Port -Port $BackendPort -TimeoutSeconds 150)) {
        Write-Host ''
        Write-Host 'Backend stdout tail:'
        Get-Content -LiteralPath $BackendOutLog -Tail 80 -ErrorAction SilentlyContinue
        Write-Host ''
        Write-Host 'Backend stderr tail:'
        Get-Content -LiteralPath $BackendErrLog -Tail 80 -ErrorAction SilentlyContinue
        throw "Backend did not start on port $BackendPort."
    }
    Write-Step "Backend started on http://127.0.0.1:$BackendPort/ (pid $($process.Id))."
}

function Start-Frontend {
    $owner = Get-PortOwner -Port $FrontendPort
    if ($owner) {
        Write-Step "Frontend already listening on port $FrontendPort (pid $($owner.OwningProcess))."
        Set-Content -LiteralPath (Join-Path $PidRoot 'frontend.pid') -Value ([string]$owner.OwningProcess) -Encoding ASCII
        return
    }

    Ensure-FrontendDependencies
    Assert-Command npm | Out-Null

    Remove-Item -LiteralPath $FrontendOutLog, $FrontendErrLog -ErrorAction SilentlyContinue
    $command = "npm --prefix `"$StudioRoot`" run dev"
    $process = Start-Process -FilePath 'cmd.exe' `
        -ArgumentList @('/c', $command) `
        -WorkingDirectory $RepoRoot `
        -RedirectStandardOutput $FrontendOutLog `
        -RedirectStandardError $FrontendErrLog `
        -WindowStyle Hidden `
        -PassThru
    Set-Content -LiteralPath (Join-Path $PidRoot 'frontend.pid') -Value ([string]$process.Id) -Encoding ASCII

    if (-not (Wait-Port -Port $FrontendPort -TimeoutSeconds 90)) {
        Write-Host ''
        Write-Host 'Frontend stdout tail:'
        Get-Content -LiteralPath $FrontendOutLog -Tail 80 -ErrorAction SilentlyContinue
        Write-Host ''
        Write-Host 'Frontend stderr tail:'
        Get-Content -LiteralPath $FrontendErrLog -Tail 80 -ErrorAction SilentlyContinue
        throw "Frontend did not start on port $FrontendPort."
    }
    $owner = Get-PortOwner -Port $FrontendPort
    if ($owner) {
        Set-Content -LiteralPath (Join-Path $PidRoot 'frontend.pid') -Value ([string]$owner.OwningProcess) -Encoding ASCII
        Write-Step "Frontend started on http://127.0.0.1:$FrontendPort/ (pid $($owner.OwningProcess))."
    } else {
        Write-Step "Frontend started on http://127.0.0.1:$FrontendPort/."
    }
}

Ensure-Postgres
Ensure-Redis
Ensure-YingyueDatabase
Ensure-StudioEnvLocal
Start-Backend
Start-Frontend

Write-Host ''
Write-Host 'YingYue local real-data services are ready:'
Write-Host "  Frontend: http://127.0.0.1:$FrontendPort/"
Write-Host "  Backend : http://127.0.0.1:$BackendPort/"
Write-Host "  Logs    : $LogRoot"
