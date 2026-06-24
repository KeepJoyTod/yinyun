@echo off
setlocal
cd /d "%~dp0"

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\stop-studio-real.ps1" %*
if errorlevel 1 (
  echo.
  echo stop.bat failed.
  call :keep_terminal
  exit /b 1
)

echo.
echo YingYue local real-data app services are stopped.
call :keep_terminal
exit /b 0

:keep_terminal
if /i "%YY_STUDIO_SKIP_HOLD%"=="1" exit /b 0
echo.
echo Terminal is kept open. Type exit and press Enter to close this window.
%ComSpec% /k
exit /b 0
