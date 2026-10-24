@echo off
title Hridved Backend
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0hridved-main"
echo ==============================================
echo   Starting Hridved Backend (http://localhost:5000)
echo ==============================================
node server.js
pause
