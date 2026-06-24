[CmdletBinding(DefaultParameterSetName = 'Exec')]
param(
    [string]$SshHost = '103.24.216.8',

    [string]$SshUser = 'root',

    [string]$SshPasswordFile = 'C:\Users\Administrator\Desktop\服务器\香港2.txt',

    [Parameter(ParameterSetName = 'Exec')]
    [string]$Command,

    [Parameter(ParameterSetName = 'Upload', Mandatory = $true)]
    [string]$UploadLocalPath,

    [Parameter(ParameterSetName = 'Upload', Mandatory = $true)]
    [string]$UploadRemotePath,

    [Parameter(ParameterSetName = 'Download', Mandatory = $true)]
    [string]$DownloadRemotePath,

    [Parameter(ParameterSetName = 'Download', Mandatory = $true)]
    [string]$DownloadLocalPath,

    [int]$TimeoutSec = 120,

    [switch]$AllowNonZeroExit
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Get-Hk2PasswordFromFile {
    param([Parameter(Mandatory = $true)][string]$Path)

    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        throw "SSH password file not found: $Path"
    }

    $lines = @(Get-Content -LiteralPath $Path | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
    if ($lines.Count -eq 0) {
        throw "SSH password file is empty: $Path"
    }

    $passwordLabels = '密码|password|passwd|pwd'
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = [string]$lines[$i]
        if ($line -notmatch $passwordLabels) {
            continue
        }
        if ($line -match '[:=：]\s*(.+)$') {
            return $Matches[1].Trim()
        }
        if ($i + 1 -lt $lines.Count) {
            return ([string]$lines[$i + 1]).Trim()
        }
    }

    $last = [string]$lines[-1]
    if ($last -match '[:=：]\s*(.+)$') {
        return $Matches[1].Trim()
    }
    return $last.Trim()
}

function New-Hk2Credential {
    $password = Get-Hk2PasswordFromFile -Path $SshPasswordFile
    if ([string]::IsNullOrWhiteSpace($password)) {
        throw "SSH password parsed empty from: $SshPasswordFile"
    }
    $secure = ConvertTo-SecureString $password -AsPlainText -Force
    [pscredential]::new($SshUser, $secure)
}

function New-Hk2Session {
    Import-Module Posh-SSH -ErrorAction Stop
    $credential = New-Hk2Credential
    New-SSHSession -ComputerName $SshHost -Credential $credential -AcceptKey -ErrorAction Stop
}

function Resolve-ParentDirectory {
    param([Parameter(Mandatory = $true)][string]$Path)

    $directory = Split-Path -Parent $Path
    if ([string]::IsNullOrWhiteSpace($directory)) {
        return (Get-Location).Path
    }
    return $directory
}

function Split-RemoteDirectory {
    param([Parameter(Mandatory = $true)][string]$Path)

    $normalized = $Path.Replace('\', '/')
    $lastSlash = $normalized.LastIndexOf('/')
    if ($lastSlash -lt 0) {
        return ''
    }
    if ($lastSlash -eq 0) {
        return '/'
    }
    return $normalized.Substring(0, $lastSlash)
}

function Split-RemoteLeaf {
    param([Parameter(Mandatory = $true)][string]$Path)

    $normalized = $Path.Replace('\', '/')
    $lastSlash = $normalized.LastIndexOf('/')
    if ($lastSlash -lt 0) {
        return $normalized
    }
    return $normalized.Substring($lastSlash + 1)
}

Write-Host "HK2 helper"
Write-Host "host: $SshHost"
Write-Host "user: $SshUser"
Write-Host "passwordFile: $SshPasswordFile"
Write-Host "mode: $($PSCmdlet.ParameterSetName)"
Write-Host ""

$session = New-Hk2Session
try {
    switch ($PSCmdlet.ParameterSetName) {
        'Exec' {
            if ([string]::IsNullOrWhiteSpace($Command)) {
                $Command = 'hostname; whoami; date; systemctl is-active yingyue-admin.service 2>/dev/null || true'
            }
            $result = Invoke-SSHCommand -SessionId $session.SessionId -Command $Command -TimeOut $TimeoutSec
            if ($result.Output) {
                $result.Output
            }
            if ($result.Error) {
                $result.Error
            }
            if ($result.ExitStatus -ne 0) {
                if ($AllowNonZeroExit) {
                    Write-Host "remoteExitStatus: $($result.ExitStatus)"
                } else {
                    throw "remote command failed: exit=$($result.ExitStatus)"
                }
            }
        }
        'Upload' {
            if (-not (Test-Path -LiteralPath $UploadLocalPath -PathType Leaf)) {
                throw "local upload file not found: $UploadLocalPath"
            }
            $remoteDirectory = Split-RemoteDirectory -Path $UploadRemotePath
            if ([string]::IsNullOrWhiteSpace($remoteDirectory)) {
                throw "UploadRemotePath must include a remote directory: $UploadRemotePath"
            }
            $sftp = New-SFTPSession -ComputerName $SshHost -Credential (New-Hk2Credential) -AcceptKey -ErrorAction Stop
            try {
                Set-SFTPItem -SessionId $sftp.SessionId -Path $UploadLocalPath -Destination $remoteDirectory -Force
                $remoteName = Split-RemoteLeaf -Path $UploadRemotePath
                $localName = Split-Path -Leaf $UploadLocalPath
                if ($remoteName -and $remoteName -ne $localName) {
                    Invoke-SSHCommand -SessionId $session.SessionId -Command "mv '$remoteDirectory/$localName' '$UploadRemotePath'" -TimeOut $TimeoutSec | Out-Null
                }
                Write-Host "uploaded: $UploadLocalPath -> $UploadRemotePath"
            } finally {
                Remove-SFTPSession -SessionId $sftp.SessionId | Out-Null
            }
        }
        'Download' {
            $localDirectory = Resolve-ParentDirectory -Path $DownloadLocalPath
            if (-not (Test-Path -LiteralPath $localDirectory -PathType Container)) {
                New-Item -ItemType Directory -Path $localDirectory -Force | Out-Null
            }
            $sftp = New-SFTPSession -ComputerName $SshHost -Credential (New-Hk2Credential) -AcceptKey -ErrorAction Stop
            try {
                Get-SFTPItem -SessionId $sftp.SessionId -Path $DownloadRemotePath -Destination $localDirectory -Force
                $downloadedName = Split-Path -Leaf $DownloadRemotePath
                $downloadedPath = Join-Path $localDirectory $downloadedName
                if ($downloadedPath -ne $DownloadLocalPath -and (Test-Path -LiteralPath $downloadedPath -PathType Leaf)) {
                    Move-Item -LiteralPath $downloadedPath -Destination $DownloadLocalPath -Force
                }
                Write-Host "downloaded: $DownloadRemotePath -> $DownloadLocalPath"
            } finally {
                Remove-SFTPSession -SessionId $sftp.SessionId | Out-Null
            }
        }
    }
} finally {
    Remove-SSHSession -SessionId $session.SessionId | Out-Null
}
