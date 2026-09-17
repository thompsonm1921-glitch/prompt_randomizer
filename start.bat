--- start.bat (原始)


+++ start.bat (修改后)
@echo off
title Prompt Randomizer
echo.
echo ========================================
echo   Prompt Randomizer - Запуск...
echo ========================================
echo.
echo Сервер запустится на http://localhost:3000
echo.
echo Чтобы остановить сервер - нажми Ctrl+C
echo или просто закрой это окно.
echo.
echo ========================================
echo.

start http://localhost:3000
npm run dev

pause
