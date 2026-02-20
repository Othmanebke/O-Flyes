# ─────────────────────────────────────────────────────────────────────────────
#  O-Flyes – Script de démarrage (dev local, sans Docker)
#  Usage : .\start-dev.ps1
# ─────────────────────────────────────────────────────────────────────────────

$root = $PSScriptRoot

Write-Host "`n✈️  O-Flyes – Démarrage des services en mode dev" -ForegroundColor Cyan
Write-Host "────────────────────────────────────────────────`n"

# Vérifier que .env existe
if (-not (Test-Path "$root\.env")) {
    Write-Host "❌  Fichier .env introuvable. Copie .env.example → .env et remplis les valeurs." -ForegroundColor Red
    exit 1
}

$services = @(
    @{ name = "auth";          port = 3001; dir = "services\auth" },
    @{ name = "database";      port = 3002; dir = "services\database" },
    @{ name = "ai";            port = 3003; dir = "services\ai" },
    @{ name = "notifications"; port = 3004; dir = "services\notifications" },
    @{ name = "payments";      port = 3005; dir = "services\payments" },
    @{ name = "metrics";       port = 3006; dir = "services\metrics" },
    @{ name = "frontend";      port = 3000; dir = "frontend" }
)

foreach ($svc in $services) {
    $dir = Join-Path $root $svc.dir
    Write-Host "▶  Démarrage $($svc.name) (port $($svc.port))..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$dir'; npm run dev" -WindowStyle Minimized
    Start-Sleep -Milliseconds 500
}

Write-Host "`n✅  Tous les services lancés !" -ForegroundColor Cyan
Write-Host "   → Frontend   : http://localhost:3000"
Write-Host "   → Auth       : http://localhost:3001/health"
Write-Host "   → Database   : http://localhost:3002/health"
Write-Host "   → AI         : http://localhost:3003/health"
Write-Host "   → Prometheus : http://localhost:9090`n"
