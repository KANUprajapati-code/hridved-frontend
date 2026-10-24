@echo off
title Hridved Full Stack
echo Starting Backend and Frontend in separate windows...
start "Hridved Backend" cmd /k "%~dp0run-backend.bat"
start "Hridved Frontend" cmd /k "%~dp0run-frontend.bat"
