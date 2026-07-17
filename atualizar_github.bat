@echo off
echo Sincronizando com o GitHub...
"C:\Program Files\Git\cmd\git.exe" pull origin main
"C:\Program Files\Git\cmd\git.exe" add .
"C:\Program Files\Git\cmd\git.exe" commit -m "Atualizacao pelo script"
"C:\Program Files\Git\cmd\git.exe" push origin main
echo.
echo =========================================
echo Atualizacao enviada com sucesso!
echo =========================================
pause
