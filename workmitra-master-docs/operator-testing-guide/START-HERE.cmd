@echo off
setlocal EnableExtensions
chcp 65001 >nul
title Job Mitra — Green Gate Check
color 0A

set "PROJECT=C:\projects\WorkMitra_Enterprise_v2"

REM പഴയ ഷോർട്ട്കട്ട്: START-HERE.cmd full  അല്ലെങ്കിൽ  circuit
if /I "%~1"=="full" goto FULL
if /I "%~1"=="circuit" goto CIRCUIT
if /I "%~1"=="report" goto REPORT

:MENU
cls
echo.
echo  ============================================================
echo    JOB MITRA — ടെസ്റ്റ് ചെക്ക് (ഒരൊറ്റ ഫയൽ മാത്രം)
echo    PC POST check pole — Enter അമർത്തിയാൽ മതി
echo  ============================================================
echo.
echo  ഈ ഫയലിൽ ഉൾപ്പെടുന്നത്:
echo.
echo   [Enter] അല്ലെങ്കിൽ 1  —  പൂർണ്ണ ഗ്രീൻ ഗേറ്റ് (15 ടെസ്റ്റ്)  ^<^< ശുപാർശ
echo   2                    —  വേഗം: Shift + Career മാത്രം (2 ടെസ്റ്റ്)
echo   3                    —  HTML റിപ്പോർട്ട് തുറക്കുക (കഴിഞ്ഞ റൺ)
echo   4                    —  പുറത്ത്
echo.
echo  -----------------------------------------------------------
echo  ഇവ ഇവിടെ റൺ ചെയ്യുന്നില്ല (ഡെവലപ്പർ മാത്രം):
echo    build, lint, preflight — കോഡ് കംപൈൽ ചെക്ക്, നിങ്ങൾക്ക് വേണ്ട
echo  -----------------------------------------------------------
echo.
echo  പ്രോജക്റ്റ്: %PROJECT%
echo.

set "CHOICE="
set /p "CHOICE=നമ്പർ ടൈപ്പ് ചെയ്യുക (Enter = പൂർണ്ണ ചെക്ക്): "

if "%CHOICE%"=="" set "CHOICE=1"
if "%CHOICE%"=="1" goto FULL
if "%CHOICE%"=="2" goto CIRCUIT
if "%CHOICE%"=="3" goto REPORT
if "%CHOICE%"=="4" goto END

echo  തെറ്റായ നമ്പർ. Enter അമർത്തി വീണ്ടും ശ്രമിക്കുക.
timeout /t 3 >nul
goto MENU

:CHECK_ENV
where npm >nul 2>&1
if errorlevel 1 (
    echo.
    echo  [പിശക്] npm കണ്ടില്ല. Node.js ഇൻസ്റ്റാൾ ചെയ്തിട്ടുണ്ടോ?
    echo  ഡെവലപ്പറോട് ചോദിക്കുക.
    echo.
    pause
    exit /b 1
)

if not exist "%PROJECT%\package.json" (
    echo.
    echo  [പിശക്] പ്രോജക്റ്റ് ഫോൾഡർ കണ്ടില്ല:
    echo  %PROJECT%
    echo.
    pause
    exit /b 1
)

cd /d "%PROJECT%"
exit /b 0

:FULL
call :CHECK_ENV
if errorlevel 1 goto END

echo.
echo  ============================================================
echo   പൂർണ്ണ ഗ്രീൻ ഗേറ്റ് — 15 ടെസ്റ്റ്
echo   കാത്തിരിക്കുക ~1 മിനിറ്റ്. വിൻഡോ അടയ്ക്കരുത്.
echo  ============================================================
echo.

call npm run test:e2e:headless
set "EXITCODE=%ERRORLEVEL%"

echo.
echo  ============================================================
if "%EXITCODE%"=="0" (
    color 0A
    echo   ഫലം: ശരിയാകാൻ സാധ്യത ഉയർന്നു — അവസാന വരിയിൽ "15 passed" നോക്കുക
    echo   15 passed = എല്ലാം ശരി. എഡിറ്റിങ്ങിലേക്ക് പോകാം.
) else (
    color 0C
    echo   ഫലം: എന്തോ ഫെയിൽ ആയി.
    echo   03_റോബോട്ടിന്_കോപ്പി_ചെയ്യാം.md തുറന്ന് Cursor-ന് ലോഗ് അയയ്ക്കുക.
)
echo  ============================================================
echo.
pause
goto END

:CIRCUIT
call :CHECK_ENV
if errorlevel 1 goto END

echo.
echo  ============================================================
echo   വേഗം ചെക്ക് — Shift + Career (2 ടെസ്റ്റ്)
echo  ============================================================
echo.

call npm run test:e2e:headless -- tests/e2e/shift-full-circuit.spec.ts tests/e2e/career-full-circuit.spec.ts
set "EXITCODE=%ERRORLEVEL%"

echo.
if "%EXITCODE%"=="0" (
    echo   2 passed = Shift + Career ശരി
) else (
    echo   ഫെയിൽ — പൂർണ്ണ ചെക്ക് (Enter=1) റൺ ചെയ്ത് നോക്കുക
)
echo.
pause
goto END

:REPORT
call :CHECK_ENV
if errorlevel 1 goto END

echo.
echo  HTML റിപ്പോർട്ട് തുറക്കുന്നു (ബ്രൗസർ)...
echo.
call npx playwright show-report
goto END

:END
endlocal
exit /b 0
