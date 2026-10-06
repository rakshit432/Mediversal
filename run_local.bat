@echo off
echo Starting Mediversal application locally...
echo.

echo Launching Backend server in a new window...
start cmd /k "cd backend && echo Installing backend dependencies... && npm install && echo Starting backend server... && npm run dev"

echo Launching Frontend client in a new window...
start cmd /k "cd frontend && echo Installing frontend dependencies... && npm install && echo Starting frontend client... && npm run dev"

echo.
echo ==========================================================
echo Servers are starting up in separate terminal windows!
echo Backend API:  http://localhost:4000
echo Web App:      http://localhost:5174 (Patient, Doctor, Admin)
echo Admin Login:  http://localhost:5174/admin-login
echo ==========================================================
pause
