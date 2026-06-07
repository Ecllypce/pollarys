@echo off
title Pollarys Dev

cd /d "%~dp0"

echo ============================================
echo  Pollarys - Modo Desenvolvimento
echo  Hot-reload ativo (Vite + Electron)
echo ============================================
echo.

:: Liberar portas de execu??es anteriores
echo [1/4] Liberando portas de desenvolvimento...
set POLLARYS_HMR_UI_PORT=5173
set POLLARYS_HMR_API_PORT=3901
set POLLARYS_DISABLE_PWA_DEV=1

:: Matar processos nas portas de dev (cmd for/f standard approach)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3901 "') do (
  taskkill /pid %%a /f >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173 "') do (
  taskkill /pid %%a /f >nul 2>&1
)

:: Aguardar libera??o das portas (ping ? mais confi?vel que timeout em todos os contextos)
ping -n 4 127.0.0.1 >nul

:: Verificar se porta 3901 foi liberada; se n?o, usar fallback 3902
netstat -ano | findstr ":3901 " >nul 2>&1
if not errorlevel 1 (
  echo  Porta 3901 ainda ocupada ^(processo fantasma^). Usando fallback 3902...
  set POLLARYS_HMR_API_PORT=3902
) else (
  echo  Porta 3901 OK.
)

:: Verificar se porta 5173 foi liberada; se n?o, usar fallback 5174
netstat -ano | findstr ":5173 " >nul 2>&1
if not errorlevel 1 (
  echo  Porta 5173 ainda ocupada ^(processo fantasma^). Usando fallback 5174...
  set POLLARYS_HMR_UI_PORT=5174
) else (
  echo  Porta 5173 OK.
)

echo  Portas configuradas: API=%POLLARYS_HMR_API_PORT% UI=%POLLARYS_HMR_UI_PORT%

:: Iniciar servidor Vite + API em nova janela
echo [2/4] Iniciando servidor de desenvolvimento...
start "Pollarys Dev Server" /D "%~dp0" node scripts\dev-web-hmr.mjs

:: Aguardar servidores iniciarem
echo [3/4] Aguardando servidores (6s)...
ping -n 7 127.0.0.1 >nul

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
