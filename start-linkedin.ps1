# start-linkedin.ps1
# 1-Click Dedicated LinkedIn Lead Cracker & Daily Content Publisher
$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  LINKEDIN LEAD CRACKER & DAILY POSTING AUTOPILOT" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Target: Website Building, Mobile Apps, SaaS Platforms & Custom Software" -ForegroundColor Gray
Write-Host "==================================================" -ForegroundColor Cyan

# 1. Verify Browser CDP port 9222
$test = Test-NetConnection -ComputerName 127.0.0.1 -Port 9222 -WarningAction SilentlyContinue
if (-not $test.TcpTestSucceeded) {
    Write-Host "🌐 Launching Chrome with CDP remote debugging on port 9222..." -ForegroundColor Yellow
    
    $chromeCandidates = @(
        "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
        "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
        "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe",
        "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
        "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe"
    )
    $bin = $chromeCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1

    if ($bin) {
        $userData = "$scriptDir\private\browser-profile"
        if (-not (Test-Path $userData)) {
            New-Item -ItemType Directory -Path $userData -Force | Out-Null
        }
        Start-Process -FilePath $bin -ArgumentList "--remote-debugging-port=9222", "--user-data-dir=`"$userData`"", "https://www.linkedin.com/feed/"
        
        Write-Host "⏳ Waiting for browser to initialize on port 9222..." -ForegroundColor Yellow
        $connected = $false
        for ($i = 0; $i -lt 10; $i++) {
            Start-Sleep -Seconds 1
            $check = Test-NetConnection -ComputerName 127.0.0.1 -Port 9222 -WarningAction SilentlyContinue
            if ($check.TcpTestSucceeded) {
                $connected = $true
                break
            }
        }
        if ($connected) {
            Write-Host "🟢 Browser CDP active on port 9222!" -ForegroundColor Green
            Write-Host "👉 NOTE: If not already logged into LinkedIn, please log in in the opened browser window." -ForegroundColor Cyan
        } else {
            Write-Host "⚠️ Browser started, continuing..." -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️ Could not locate Chrome or Edge executable." -ForegroundColor Red
    }
} else {
    Write-Host "🟢 Browser CDP is already active on port 9222." -ForegroundColor Green
}

# 2. Launch LinkedIn Worker
Write-Host "🚀 Launching LinkedIn Lead Discovery & Publishing Engine..." -ForegroundColor Green
& node "$scriptDir\threads-agent.js" run linkedin @args
