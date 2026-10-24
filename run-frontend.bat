@echo off
title Hridved Frontend
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0hridved-frontend-main"
echo ==============================================
echo   Starting Hridved Frontend (http://localhost:5173)
echo ==============================================
node ./node_modules/vite/bin/vite.js
pause
