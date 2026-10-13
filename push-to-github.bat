@echo off
title Uploading VIP-STORE to GitHub
cd /d "%~dp0"
"C:\Program Files\Git\cmd\git.exe" push -u origin main
pause
