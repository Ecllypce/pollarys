@echo off
title Pollarys Dev

cd /d "%~dp0"

echo ============================================
echo  Pollarys - Modo Desenvolvimento
echo  Hot-reload ativo (Vite + Electron)
echo ============================================
echo.

:: Liberar portas de execuções anteriores
echo [1/4] Liberando portas de desenvolvimento...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3901 "') do taskkill /pid %%a /f >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173 "') do taskkill /pid %%a /f >nul 2>&1
echo  Portas 3901 e 5173 liberadas.

:: Configurar ambiente de desenvolvimento
set POLLARYS_HMR_UI_PORT=5173
set POLLARYS_HMR_API_PORT=3901
set POLLARYS_DISABLE_PWA_DEV=1

:: Iniciar servidor Vite + API em nova janela
echo [2/4] Iniciando servidor de desenvolvimento...
start "Pollarys Dev Server" /D "%~dp0" node scripts\dev-web-hmr.mjs

:: Aguardar servidores iniciarem
echo [3/4] Aguardando servidores (6s)...
timeout /t 6 /nobreak >nul

:: Iniciar Electron
echo [4/4] Iniciando Electron...
cd packages\electron
set POLLARYS_ELECTRON_DEV=1
npx electron ./main.mjs

:: Limpeza ao encerrar
echo.
echo Encerrando servidor de desenvolvimento...
taskkill /f /fi "WindowTitle eq Pollarys Dev Server" >nul 2>&1
echo Pollarys encerrado.
pause
