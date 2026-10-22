@echo off
REM start-linkedin.bat
REM 1-Click LinkedIn Lead Cracker & Daily Content Engine
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-linkedin.ps1" %*
pause
