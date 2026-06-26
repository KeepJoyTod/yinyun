@echo off
setlocal
cd /d "%~dp0"

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\start-studio-real.ps1" %*
if errorlevel 1 (
  echo.
  echo start.bat failed. See logs\local-real for details.
  call :keep_terminal
  exit /b 1
)

echo.
echo YingYue local real-data services are running.
echo Frontend: http://127.0.0.1:5190/
echo Backend : http://127.0.0.1:8080/
echo Logs    : %~dp0logs\local-real
call :open_log_terminal "YingYue Backend Logs" "%~dp0logs\local-real\backend.out.log" "%~dp0logs\local-real\backend.err.log"
call :open_log_terminal "YingYue Frontend Logs" "%~dp0logs\local-real\frontend.out.log" "%~dp0logs\local-real\frontend.err.log"
call :keep_terminal
exit /b 0

:open_log_terminal
if /i "%YY_STUDIO_SKIP_LOG_WINDOWS%"=="1" exit /b 0
set "YY_LOG_TITLE=%~1"
set "YY_LOG_OUT=%~2"
set "YY_LOG_ERR=%~3"
start "%YY_LOG_TITLE%" powershell.exe -NoExit -NoProfile -ExecutionPolicy Bypass -Command ^
  "$host.UI.RawUI.WindowTitle='%YY_LOG_TITLE%';" ^
  "[Console]::InputEncoding=[System.Text.Encoding]::UTF8; [Console]::OutputEncoding=[System.Text.Encoding]::UTF8;" ^
  "$out='%YY_LOG_OUT%'; $err='%YY_LOG_ERR%';" ^
  "while (-not ((Test-Path -LiteralPath $out) -and (Test-Path -LiteralPath $err))) { Write-Host 'Waiting for log files...'; Start-Sleep -Seconds 1 };" ^
  "Write-Host '[stdout]'; Get-Content -LiteralPath $out -Encoding UTF8 -Tail 80;" ^
  "Write-Host ''; Write-Host '[stderr]'; Get-Content -LiteralPath $err -Encoding UTF8 -Tail 80;" ^
  "Write-Host ''; Write-Host 'Following stdout and stderr. Press Ctrl+C to stop this log window.';" ^
  "$jobs=@();" ^
  "$jobs += Start-Job -ScriptBlock { param($p) Get-Content -LiteralPath $p -Encoding UTF8 -Wait } -ArgumentList $out;" ^
  "$jobs += Start-Job -ScriptBlock { param($p) Get-Content -LiteralPath $p -Encoding UTF8 -Wait } -ArgumentList $err;" ^
  "while ($true) { Receive-Job -Job $jobs; Start-Sleep -Milliseconds 500 }"
exit /b 0

:keep_terminal
if /i "%YY_STUDIO_SKIP_HOLD%"=="1" exit /b 0
echo.
echo Terminal is kept open. Type exit and press Enter to close this window.
%ComSpec% /k
exit /b 0
