@echo off
echo Starting Mediversal application locally...
echo.

echo Launching Backend server in a new window...
start cmd /k "cd backend && echo Installing backend dependencies... && npm install && echo Starting backend server... && npm run dev"

echo Launching Frontend client in a new window...
start cmd /k "cd frontend && echo Installing frontend dependencies... && npm install && echo Starting frontend client... && npm run dev"

echo.
echo ==========================================================
echo Both servers are starting up in separate terminal windows!
echo Backend: http://localhost:4000
echo Frontend: http://localhost:5173 or http://localhost:5174
echo ==========================================================
pause
