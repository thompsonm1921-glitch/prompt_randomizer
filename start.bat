@echo off
chcp 65001 >nul
title Prompt Randomizer
echo.
echo ========================================
echo   Prompt Randomizer - Starting...
echo ========================================
echo.
echo Server will run on http://localhost:3000
echo.
echo To stop server - press Ctrl+C
echo or just close this window.
echo.
echo ========================================
echo.

start http://localhost:3000
npm run dev

pause
