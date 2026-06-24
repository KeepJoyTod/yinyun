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
call :keep_terminal
exit /b 0

:keep_terminal
if /i "%YY_STUDIO_SKIP_HOLD%"=="1" exit /b 0
echo.
echo Terminal is kept open. Type exit and press Enter to close this window.
%ComSpec% /k
exit /b 0
