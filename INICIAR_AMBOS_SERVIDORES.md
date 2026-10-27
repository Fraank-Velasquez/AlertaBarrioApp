# Script para ejecutar Backend y Frontend simultáneamente

## Opción 1: Usando concurrently (Recomendado)

### Instalar en raíz del proyecto
```bash
npm init -y
npm install --save-dev concurrently
```

### Agregar script al package.json raíz
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "cd Backend && mvnw spring-boot:run",
    "dev:frontend": "cd Frontend/AlertaBarrio && npm run dev"
  }
}
```

### Ejecutar
```bash
npm run dev
```

## Opción 2: Usando start.bat (Windows)

Crear `start.bat` en la raíz del proyecto:

```bat
@echo off
start "AlertaBarrio Backend" cmd /k "cd /d %~dp0Backend && mvnw spring-boot:run"
timeout /t 5 /nobreak > nul
start "AlertaBarrio Frontend" cmd /k "cd /d %~dp0Frontend\AlertaBarrio && npm run dev"
echo Ambos servidores iniciados
```

Ejecutar `start.bat` haciendo doble clic.

## Opción 3: Usando PowerShell

Crear `start.ps1`:

```powershell
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\Backend'; .\mvnw spring-boot:run"
Start-Sleep -Seconds 5
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\Frontend\AlertaBarrio'; npm run dev"
```

Ejecutar: `powershell -ExecutionPolicy Bypass -File start.ps1`
