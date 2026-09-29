@echo off
echo =================================================================
echo Starting Multilingual Mass Communication Platform Services...
echo =================================================================

set ROOT_DIR=%~dp0
set VENV_PY=python
set NODE_DIR=%LOCALAPPDATA%\Microsoft\WinGet\Packages\OpenJS.NodeJS.LTS_Microsoft.Winget.Source_8wekyb3d8bbwe\node-v24.19.0-win-x64
set PATH=%NODE_DIR%;%PATH%

:: 1. Django Backend
echo [1/3] Starting Django Backend on http://127.0.0.1:8000...
start "Backend (Django Port 8000)" cmd /k "cd /d "%ROOT_DIR%backend" && "%VENV_PY%" manage.py runserver 127.0.0.1:8000"

:: 2. FastAPI AI Service
echo [2/3] Starting AI Service on http://127.0.0.1:8001...
start "AI Service (FastAPI Port 8001)" cmd /k "cd /d "%ROOT_DIR%ai-service" && "%VENV_PY%" -m uvicorn main:app --host 127.0.0.1 --port 8001 --reload"

:: 3. React Vite Frontend
echo [3/3] Starting React Frontend on http://localhost:5173...
start "Frontend (Vite Port 5173)" cmd /k "cd /d "%ROOT_DIR%frontend" && set PATH=%NODE_DIR%;%%PATH%% && npm.cmd run dev"

echo.
echo All services launched!
echo - Frontend:   http://localhost:5173
echo - Backend:    http://127.0.0.1:8000/api/v1/health/
echo - AI Service: http://127.0.0.1:8001/docs
echo.
