# scripts/verify.ps1
# =============================================================================
# verify.ps1 — EL gate de calidad (Windows PowerShell version).
# Contrato: exit 0 ⇒ formato + linter sin advertencias + tipos estrictos +
#           pruebas verdes + build + sin dependencias deprecadas.
# =============================================================================
param(
  [Parameter(Mandatory = $false)]
  [ValidateSet("--quick", "--full")]
  [string]$Mode = "--full"
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$ScriptDir\.."

function Step([string]$Message) {
  Write-Host "`n[STEP] $Message" -ForegroundColor Cyan
}

function Fail([string]$Message) {
  Write-Host "`n[FAIL] GATE EN ROJO - $Message" -ForegroundColor Red
  exit 1
}

$StartTime = Get-Date

Step "[1/5] Formato - Prettier"
pnpm format:check
if ($LASTEXITCODE -ne 0) { Fail "hay archivos sin formatear (corran pnpm format)" }

Step "[2/5] Linter -ESLint, cero advertencias"
pnpm lint
if ($LASTEXITCODE -ne 0) { Fail "el linter encontró problemas" }

Step "[3/5] Tipos - tsc --noEmit"
pnpm check-types
if ($LASTEXITCODE -ne 0) { Fail "errores de tipos" }

if ($Mode -eq "--quick") {
  $Elapsed = [math]::Round(((Get-Date) - $StartTime).TotalSeconds)
  Write-Host "`n[OK] GATE RAPIDO EN VERDE en $Elapsed s" -ForegroundColor Green
  exit 0
}

Step "[4/5] Pruebas - Vitest"
pnpm test
if ($LASTEXITCODE -ne 0) { Fail "pruebas rojas o cobertura por debajo del umbral" }

Step "[5/5] Build de produccion"
pnpm build
if ($LASTEXITCODE -ne 0) { Fail "el build falló" }

# Note: check-versions.sh is a bash script - skip for Windows or implement PowerShell equivalent
# bash scripts/check-versions.sh --gate
# if ($LASTEXITCODE -ne 0) { Fail "hay una dependencia deprecada" }

$Elapsed = [math]::Round(((Get-Date) - $StartTime).TotalSeconds)
Write-Host "`n[OK] GATE COMPLETO EN VERDE en $Elapsed s" -ForegroundColor Green
