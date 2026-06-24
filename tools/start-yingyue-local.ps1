[CmdletBinding()]
param(
    [string]$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path,
    [switch]$SkipFrontend,
    [switch]$SkipPrototype,
    [switch]$SkipBackend
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$backendRoot = Join-Path $RepoRoot 'backend'
$adminRoot = Join-Path $RepoRoot 'admin-ui'
$prototypeRoot = Join-Path $RepoRoot 'prototype-next'
$logRoot = Join-Path $RepoRoot 'logs'
New-Item -ItemType Directory -Force -Path $logRoot | Out-Null

function Test-PortListening {
    param([int]$Port)
    $null -ne (Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -eq $Port } | Select-Object -First 1)
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

function Test-DockerReady {
    docker version --format '{{.Server.Version}}' 2>$null | Out-Null
    return $LASTEXITCODE -eq 0
}

function Start-DockerDesktop {
    if (Test-DockerReady) {
        return
    }
    $dockerDesktop = 'C:\Program Files\Docker\Docker\Docker Desktop.exe'
    if (Test-Path -LiteralPath $dockerDesktop) {
        Start-Process -FilePath $dockerDesktop -WindowStyle Hidden
    }
    $deadline = (Get-Date).AddSeconds(120)
    while ((Get-Date) -lt $deadline) {
        if (Test-DockerReady) {
            return
        }
        Start-Sleep -Seconds 3
    }
    throw 'Docker engine is not running. Start Docker Desktop, then run this script again.'
}

function Ensure-Postgres {
    Start-DockerDesktop
    $exists = docker ps -a --format '{{.Names}}' | Where-Object { $_ -eq 'yy-postgres' }
    if ($exists) {
        docker start yy-postgres | Out-Null
    } else {
        docker run -d --name yy-postgres `
            -e POSTGRES_USER=postgres `
            -e POSTGRES_PASSWORD=postgres `
            -e POSTGRES_DB=yingyue_cloud `
            -p 5432:5432 `
            postgres:16-alpine | Out-Null
    }
    if (-not (Wait-Port -Port 5432 -TimeoutSeconds 90)) {
        throw 'PostgreSQL did not start on port 5432.'
    }
}

function Ensure-Redis {
    Start-DockerDesktop
    $exists = docker ps -a --format '{{.Names}}' | Where-Object { $_ -eq 'yy-redis' }
    if ($exists) {
        docker start yy-redis | Out-Null
    } else {
        docker run -d --name yy-redis -p 6379:6379 redis:7.2.8 redis-server --requirepass redis123 | Out-Null
    }
    if (-not (Wait-Port -Port 6379 -TimeoutSeconds 90)) {
        throw 'Redis did not start on port 6379.'
    }
}

function Get-RedisPassword {
    $cmd = docker inspect yy-redis --format '{{json .Config.Cmd}}' | ConvertFrom-Json
    for ($i = 0; $i -lt $cmd.Count; $i++) {
        if ($cmd[$i] -eq '--requirepass' -and $i + 1 -lt $cmd.Count) {
            return [string]$cmd[$i + 1]
        }
    }
    return ''
}

function Ensure-YingyueDatabase {
    $tableCount = docker exec yy-postgres psql -U postgres -d yingyue_cloud -tAc "select count(*) from information_schema.tables where table_schema='public';"
    if ([int]$tableCount.Trim() -gt 0) {
        return
    }
    $sqlRoot = Join-Path $backendRoot 'script/sql/postgres'
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
        Write-Host "Importing $file"
        Get-Content -LiteralPath $path -Raw -Encoding UTF8 | docker exec -i yy-postgres psql -U postgres -d yingyue_cloud -v ON_ERROR_STOP=1 | Out-Null
    }
}

function Start-Backend {
    if ($SkipBackend -or (Test-PortListening -Port 8080)) {
        return
    }
    $redisPassword = Get-RedisPassword
    $logPath = Join-Path $logRoot 'ruoyi-admin-dev.log'
    $command = @"
`$env:DB_URL='jdbc:postgresql://127.0.0.1:5432/yingyue_cloud?useUnicode=true&characterEncoding=utf8&sslmode=disable&reWriteBatchedInserts=true'
`$env:DB_USERNAME='postgres'
`$env:DB_PASSWORD='postgres'
`$env:REDIS_PASSWORD='$redisPassword'
`$env:API_DECRYPT_ENABLED='false'
cd '$backendRoot'
java -jar '.\ruoyi-admin\target\ruoyi-admin.jar' --spring.profiles.active=dev *> '$logPath'
"@
    Start-Process -FilePath 'powershell.exe' -ArgumentList @('-NoProfile', '-Command', $command) -WindowStyle Hidden
    if (-not (Wait-Port -Port 8080 -TimeoutSeconds 150)) {
        throw "Backend did not start on port 8080. See $logPath"
    }
}

function Start-AdminUi {
    if ($SkipFrontend -or (Test-PortListening -Port 5180)) {
        return
    }
    Start-Process -FilePath 'powershell.exe' -ArgumentList @('-NoProfile', '-Command', "cd '$adminRoot'; npm run dev") -WindowStyle Hidden
    if (-not (Wait-Port -Port 5180 -TimeoutSeconds 90)) {
        throw 'Admin UI did not start on port 5180.'
    }
}

function Start-Prototype {
    if ($SkipPrototype -or (Test-PortListening -Port 3000)) {
        return
    }
    $command = @"
`$env:DATABASE_URL='postgresql://camera:camera@localhost:55432/camera_studio?schema=public'
cd '$prototypeRoot'
npm run dev
"@
    Start-Process -FilePath 'powershell.exe' -ArgumentList @('-NoProfile', '-Command', $command) -WindowStyle Hidden
    if (-not (Wait-Port -Port 3000 -TimeoutSeconds 90)) {
        throw 'Prototype frontend did not start on port 3000.'
    }
}

Ensure-Postgres
Ensure-Redis
Ensure-YingyueDatabase
Start-Backend
Start-AdminUi
Start-Prototype

Write-Host ''
Write-Host '影约云本地服务已启动：'
Write-Host '  管理后台: http://localhost:5180/'
Write-Host '  后端 API: http://localhost:8080/'
Write-Host '  用户端预约: http://localhost:3000/booking'
Write-Host ''
Write-Host '默认后台账号：000000 / admin / admin123'
