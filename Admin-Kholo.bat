@echo off
REM ============================================================================
REM ADMIN PANEL KHOLO - is file pe double-click karo.
REM 1) GitHub se aaj ki nayi report laata hai (roz subah 8 baje AI agent banata hai)
REM 2) Site ko sirf IS computer pe chalu karta hai (bahar se koi nahi dekh sakta)
REM 3) Browser me admin panel kholta hai -> sabse upar "Aaj aapka kaam"
REM Band karna ho to "HomeMoney Calc server" wali kaali window band kar do.
REM ============================================================================
cd /d "%~dp0"
title HomeMoney Calc - Admin

echo.
echo  [1/3] GitHub se aaj ki report la rahe hain...
git switch main >nul 2>&1
if errorlevel 1 (
  echo  Main branch par switch nahi hua. Local changes ko pehle save/commit karvao.
  pause
  exit /b 1
)
git pull --ff-only
if errorlevel 1 echo  (Report update nahi hui - internet check karo. Purani report dikhegi.)

echo  [*] Project ke lockfile ke mutabik dependencies sync ho rahi hain...
call npm ci --no-audit --no-fund
if errorlevel 1 (
  echo  Dependencies install nahi hui. Internet aur npm error check karo.
  pause
  exit /b 1
)

echo  [2/3] Admin panel chalu ho raha hai...
start "HomeMoney Calc server" cmd /k "npm run dev -- -p 3123"

echo  [3/3] 15 second me browser khulega...
timeout /t 15 /nobreak >nul
start "" http://127.0.0.1:3123/admin/

echo.
echo  Ho gaya! Browser me admin panel khul gaya hoga.
echo  Page khaali dikhe to 10 second ruk ke F5 (refresh) dabao.
echo.
timeout /t 8 >nul
