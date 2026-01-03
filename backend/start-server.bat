@echo off
echo Starting Krazy Girls Backend Server...
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    echo.
)

REM Check if .env exists
if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env 2>nul
    echo Please update .env file with your credentials
    echo.
)

REM Start the server
echo Starting server on http://localhost:5000
echo Press Ctrl+C to stop the server
echo.
npm run dev

pause
