@echo off
echo Stopping all platform services...

taskkill /F /IM node.exe /T 2>nul
taskkill /F /FI "WINDOWTITLE eq Backend*" 2>nul
taskkill /F /FI "WINDOWTITLE eq AI Service*" 2>nul
taskkill /F /FI "WINDOWTITLE eq Frontend*" 2>nul

echo Services stopped.
pause
