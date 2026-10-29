@echo off
start "AlertaBarrio Backend" cmd /k "cd /d %~dp0Backend && mvnw.cmd spring-boot:run"
timeout /t 5 /nobreak > nul
start "AlertaBarrio Frontend" cmd /k "cd /d %~dp0Frontend\AlertaBarrio && npm run dev"
echo Ambos servidores iniciados en ventanas separadas
pause
