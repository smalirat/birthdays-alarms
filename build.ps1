# Arma el ZIP para subir a la Chrome Web Store (solo los archivos de la extensión).
# Uso: .\build.ps1
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

$version = (Get-Content manifest.json -Raw | ConvertFrom-Json).version
$files = @('manifest.json', 'popup.html', 'popup.css', 'popup.js', 'calendar-button.js', 'icons')

New-Item -ItemType Directory -Force dist | Out-Null
$zip = "dist\birthdays-alarms-$version.zip"
if (Test-Path $zip) { Remove-Item $zip }

# bsdtar genera rutas con "/" (Compress-Archive usa "\" y la Web Store lo rechaza)
tar -a -c -f $zip @files
if ($LASTEXITCODE -ne 0) { throw 'Falló la creación del ZIP' }

Write-Host "Listo: $zip"
tar -t -f $zip
