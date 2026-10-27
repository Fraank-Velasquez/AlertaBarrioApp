Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\Backend'; .\mvnw spring-boot:run"
Start-Sleep -Seconds 5
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\Frontend\AlertaBarrio'; npm run dev"
Write-Host "Ambos servidores iniciados"
