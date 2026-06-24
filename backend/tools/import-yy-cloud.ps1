param(
  [ValidateSet('mysql', 'postgres')]
  [string]$Engine = 'mysql',

  [string]$DbHost = 'localhost',
  [int]$Port = 0,
  [string]$Database = '',
  [string]$User = '',
  [string]$Password = '',

  [string]$MysqlExe = 'mysql',
  [string]$PsqlExe = 'psql',

  [switch]$IncludeBaseSchema,

  [switch]$SkipCodegen,

  [switch]$IncludeDemoData
)

$ErrorActionPreference = 'Stop'

if ($Port -eq 0) {
  $Port = if ($Engine -eq 'postgres') { 5432 } else { 3306 }
}

if ([string]::IsNullOrWhiteSpace($Database)) {
  $Database = if ($Engine -eq 'postgres') { 'yingyue_cloud' } else { 'ry-vue' }
}

if ([string]::IsNullOrWhiteSpace($User)) {
  $User = if ($Engine -eq 'postgres') { 'postgres' } else { 'root' }
}

if ([string]::IsNullOrEmpty($Password)) {
  $secure = Read-Host "请输入 $User@$DbHost 的数据库密码" -AsSecureString
  $Password = [System.Net.NetworkCredential]::new('', $secure).Password
}

$repoRoot = Split-Path -Parent $PSScriptRoot
$sqlRoot = Join-Path $repoRoot 'script/sql'

if ($Engine -eq 'postgres') {
  $files = @()
  if ($IncludeBaseSchema) {
    $files += @(
      (Join-Path $sqlRoot 'postgres/postgres_ry_vue_5.X.sql'),
      (Join-Path $sqlRoot 'postgres/postgres_ry_job.sql'),
      (Join-Path $sqlRoot 'postgres/postgres_ry_workflow.sql')
    )
  }
  $files += Join-Path $sqlRoot 'postgres/postgres_yy_cloud.sql'
  if (-not $SkipCodegen) {
    $files += Join-Path $sqlRoot 'postgres/postgres_yy_cloud_codegen.sql'
  }
  if ($IncludeDemoData) {
    $files += Join-Path $sqlRoot 'postgres/postgres_yy_cloud_demo_data.sql'
  }
} else {
  $files = @()
  if ($IncludeBaseSchema) {
    $files += @(
      (Join-Path $sqlRoot 'ry_vue_5.X.sql'),
      (Join-Path $sqlRoot 'ry_job.sql'),
      (Join-Path $sqlRoot 'ry_workflow.sql')
    )
  }
  $files += Join-Path $sqlRoot 'yy_cloud.sql'
  if (-not $SkipCodegen) {
    $files += Join-Path $sqlRoot 'yy_cloud_codegen.sql'
  }
  if ($IncludeDemoData) {
    $files += Join-Path $sqlRoot 'yy_cloud_demo_data.sql'
  }
}

foreach ($file in $files) {
  if (-not (Test-Path -LiteralPath $file)) {
    throw "SQL 文件不存在: $file"
  }
}

function Invoke-MysqlFile {
  param([string]$File)

  $oldMysqlPwd = $env:MYSQL_PWD
  try {
    $env:MYSQL_PWD = $Password
    $args = @(
      "--host=$DbHost",
      "--port=$Port",
      "--user=$User",
      '--default-character-set=utf8mb4',
      $Database
    )
    Write-Host "执行 MySQL SQL: $File"
    Get-Content -LiteralPath $File -Raw -Encoding UTF8 | & $MysqlExe @args
  } finally {
    $env:MYSQL_PWD = $oldMysqlPwd
  }
}

function Invoke-PostgresFile {
  param([string]$File)

  $oldPgPassword = $env:PGPASSWORD
  try {
    $env:PGPASSWORD = $Password
    $args = @(
      "--host=$DbHost",
      "--port=$Port",
      "--username=$User",
      "--dbname=$Database",
      "--file=$File"
    )
    Write-Host "执行 PostgreSQL SQL: $File"
    & $PsqlExe @args
  } finally {
    $env:PGPASSWORD = $oldPgPassword
  }
}

foreach ($file in $files) {
  if ($Engine -eq 'postgres') {
    Invoke-PostgresFile -File $file
  } else {
    Invoke-MysqlFile -File $file
  }
}

Write-Host "影约云数据库脚本执行完成。"
