@echo off
chcp 65001 >nul
cd /d "%~dp0"
node build.js
echo.
echo Pronto! Envie o arquivo da pasta SUBIR-NO-SITE para o site.
pause
