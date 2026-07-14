@echo off
title JELA Unified Runner
echo ============================================================
echo          KIEM TRA THU VIEN VA KHOI CHAY HE THONG JELA
echo ============================================================
echo.

:: 1. Check Python dependencies
echo [1/3] Kiem tra thu vien Python (jela-ai)...
cd jela-ai
call pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [WARNING] Co loi khi kiem tra hoac tai thu vien Python.
)
cd ..
echo [OK] Thu vien Python da san sang.
echo.

:: 2. Check Node dependencies
echo [2/3] Kiem tra thu vien Frontend (jela-web)...
if not exist "jela-web\node_modules" (
    echo Thu muc node_modules chua ton tai. Dang chay npm install...
    cd jela-web
    call npm install
    cd ..
) else (
    echo [OK] Thu vien Frontend da san sang.
)
echo.

:: 3. Run all services
echo [3/3] Dang khoi chay cac dich vu...
echo ------------------------------------------------------------
echo * Local LLM:    Ollama (qwen2.5:3b)
echo * AI Service:   FastAPI on Port 8000
echo * Backend API:  Spring Boot on Port 8080
echo * Frontend Web: Vite on Port 5173
echo ------------------------------------------------------------

echo [Ollama] Kiem tra/Tai mo hinh qwen2.5:3b...
call ollama pull qwen2.5:3b

start "JELA AI Service (Port 8000)" cmd /k "cd jela-ai && python main.py"
start "JELA Backend API (Port 8080)" cmd /k "cd jela-api && mvn spring-boot:run"
start "JELA Frontend Web (Port 5173)" cmd /k "cd jela-web && npm run dev"

echo.
echo ============================================================
echo Da kich hoat khoi chay tat ca dich vu!
echo Vui long xem log tai cac cua so Terminal rieng biet.
echo ============================================================
echo.
pause
