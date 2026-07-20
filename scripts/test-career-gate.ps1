<#
.SYNOPSIS
  End-to-end test for the Career Employment Gate (3-step lifecycle).

.DESCRIPTION
  Runs db:seed:career to create/reset test data, then exercises all 3 gate steps
  via HTTP, verifying status codes, response shapes, and idempotency.

.PARAMETER BaseUrl
  API base URL. Defaults to http://localhost:3001

.PARAMETER EmployerPassword
  Password for the staging employer account. Reads from SEED_EMPLOYER_PASSWORD if omitted.

.PARAMETER EmployeePassword
  Password for the staging employee account. Reads from SEED_EMPLOYEE_PASSWORD if omitted.

.EXAMPLE
  $env:SEED_EMPLOYER_PASSWORD = "changeme"; $env:SEED_EMPLOYEE_PASSWORD = "changeme"
  .\scripts\test-career-gate.ps1

.NOTES
  Requires: API server running (npm run dev:db), DATABASE_URL set, users seeded (npm run db:seed)
#>

[CmdletBinding()]
param(
  [string]$BaseUrl = "http://localhost:3001",
  [string]$EmployerPassword = $env:SEED_EMPLOYER_PASSWORD,
  [string]$EmployeePassword = $env:SEED_EMPLOYEE_PASSWORD
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ─── Helpers ─────────────────────────────────────────────────────────────────

$PassCount = 0
$FailCount = 0

function Write-Step([string]$label) {
  Write-Host "`n── $label" -ForegroundColor Cyan
}

function Write-Pass([string]$msg) {
  Write-Host "  ✅ PASS  $msg" -ForegroundColor Green
  $script:PassCount++
}

function Write-Fail([string]$msg) {
  Write-Host "  ❌ FAIL  $msg" -ForegroundColor Red
  $script:FailCount++
}

function Assert-Status([int]$got, [int]$want, [string]$label) {
  if ($got -eq $want) {
    Write-Pass "$label — HTTP $got"
  } else {
    Write-Fail "$label — expected HTTP $want, got $got"
  }
}

function Assert-Field($obj, [string]$path, $expected, [string]$label) {
  $parts = $path -split "\."
  $val = $obj
  foreach ($p in $parts) { $val = $val.$p }
  if ($val -eq $expected) {
    Write-Pass "$label — $path = '$expected'"
  } else {
    Write-Fail "$label — $path expected '$expected', got '$val'"
  }
}

function Assert-NotNull($val, [string]$label) {
  if ($null -ne $val -and $val -ne "") {
    Write-Pass "$label — present"
  } else {
    Write-Fail "$label — was null/empty"
  }
}

function Invoke-Api {
  param(
    [string]$Method,
    [string]$Path,
    [object]$Body = $null,
    [Microsoft.PowerShell.Commands.WebRequestSession]$Session
  )

  $uri = "$BaseUrl$Path"
  $params = @{
    Method      = $Method
    Uri         = $uri
    ContentType = "application/json"
    WebSession  = $Session
  }
  if ($null -ne $Body) {
    $params.Body = ($Body | ConvertTo-Json -Depth 10)
  }

  try {
    $response = Invoke-WebRequest @params
    return @{
      Status = [int]$response.StatusCode
      Data   = ($response.Content | ConvertFrom-Json)
    }
  } catch [System.Net.WebException] {
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $raw = $reader.ReadToEnd()
    $data = $null
    try { $data = $raw | ConvertFrom-Json } catch {}
    return @{
      Status = [int]$_.Exception.Response.StatusCode
      Data   = $data
    }
  }
}

function Login([string]$Email, [string]$Password) {
  $session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
  $result = Invoke-Api -Method POST -Path "/v1/jobmitra/auth/login" `
    -Body @{ email = $Email; password = $Password } -Session $session
  if ($result.Status -ne 200) {
    throw "Login failed for '$Email' — HTTP $($result.Status): $($result.Data | ConvertTo-Json)"
  }
  return $session
}

# ─── Preflight checks ────────────────────────────────────────────────────────

Write-Host ""
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  Job Mitra — Career Employment Gate End-to-End Test   " -ForegroundColor Magenta
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Magenta

if (-not $EmployerPassword) {
  Write-Host "`n[ERROR] EmployerPassword not set. Use -EmployerPassword or set `$env:SEED_EMPLOYER_PASSWORD" -ForegroundColor Red
  exit 1
}
if (-not $EmployeePassword) {
  Write-Host "`n[ERROR] EmployeePassword not set. Use -EmployeePassword or set `$env:SEED_EMPLOYEE_PASSWORD" -ForegroundColor Red
  exit 1
}

# ─── Step 0: Seed career data ────────────────────────────────────────────────

Write-Step "Step 0: Seeding career test data"

$projectRoot = Split-Path $PSScriptRoot -Parent
$seedOutput = & npm --prefix $projectRoot run db:seed:career 2>&1
Write-Host ($seedOutput -join "`n") -ForegroundColor DarkGray

$applicationId = ($seedOutput | Where-Object { $_ -match "APPLICATION_ID=(.+)" } |
  ForEach-Object { $Matches[1] } | Select-Object -First 1)?.Trim()

$employerEmail = ($seedOutput | Where-Object { $_ -match "EMPLOYER_EMAIL=(.+)" } |
  ForEach-Object { $Matches[1] } | Select-Object -First 1)?.Trim()

$employeeEmail = ($seedOutput | Where-Object { $_ -match "EMPLOYEE_EMAIL=(.+)" } |
  ForEach-Object { $Matches[1] } | Select-Object -First 1)?.Trim()

if (-not $applicationId) {
  Write-Host "[ERROR] Could not parse APPLICATION_ID from seed output" -ForegroundColor Red
  exit 1
}

Write-Pass "Seed complete — application_id=$applicationId"
Write-Host "  employer : $employerEmail" -ForegroundColor DarkGray
Write-Host "  employee : $employeeEmail" -ForegroundColor DarkGray

# ─── Step 1: Employer issues offer ───────────────────────────────────────────

Write-Step "Step 1: Employer issues offer (gate step 1/3)"

$employerSession = Login -Email $employerEmail -Password $EmployerPassword
Write-Pass "Employer logged in"

$offerBody = @{
  terms = @{
    salary_per_month = 45000
    currency         = "INR"
    notice_period    = "30 days"
    start_date       = "2026-09-01"
    work_type        = "full-time"
  }
  expires_at = (Get-Date).AddDays(14).ToString("o")
}

$offerResult = Invoke-Api -Method POST `
  -Path "/v1/jobmitra/employer/career/applications/$applicationId/offer" `
  -Body $offerBody -Session $employerSession

Assert-Status $offerResult.Status 201 "Issue offer"
Assert-NotNull $offerResult.Data.data.offer.id "offer.id"
Assert-Field $offerResult.Data.data.offer "status" "pending" "offer.status"
Assert-NotNull $offerResult.Data.meta.requestId "meta.requestId"

# Verify second call returns 409 CONFLICT (no double offer)
$dupOffer = Invoke-Api -Method POST `
  -Path "/v1/jobmitra/employer/career/applications/$applicationId/offer" `
  -Body $offerBody -Session $employerSession

Assert-Status $dupOffer.Status 409 "Duplicate offer blocked"
Assert-Field $dupOffer.Data.error "code" "CONFLICT" "error.code on duplicate"

# ─── Step 2: Employee accepts offer ──────────────────────────────────────────

Write-Step "Step 2: Employee accepts offer (gate step 2/3)"

$employeeSession = Login -Email $employeeEmail -Password $EmployeePassword
Write-Pass "Employee logged in"

# First verify wrong application ID returns 404
$wrongApp = Invoke-Api -Method POST `
  -Path "/v1/jobmitra/employee/career/applications/00000000-0000-0000-0000-000000000000/offer/accept" `
  -Session $employeeSession

Assert-Status $wrongApp.Status 404 "Accept on unknown applicationId → 404"

# Accept the real offer
$acceptResult = Invoke-Api -Method POST `
  -Path "/v1/jobmitra/employee/career/applications/$applicationId/offer/accept" `
  -Session $employeeSession

Assert-Status $acceptResult.Status 200 "Accept offer"
Assert-Field $acceptResult.Data.data.application "status" "offer_accepted" "application.status after accept"

# Verify double-accept returns 409
$dupAccept = Invoke-Api -Method POST `
  -Path "/v1/jobmitra/employee/career/applications/$applicationId/offer/accept" `
  -Session $employeeSession

Assert-Status $dupAccept.Status 409 "Double accept blocked"
Assert-Field $dupAccept.Data.error "code" "INVALID_STATE" "error.code on double accept"

# ─── RBAC check: Employer cannot call employee endpoint ──────────────────────

Write-Step "RBAC: Employer session rejected on employee endpoints"

$rbacCheck = Invoke-Api -Method POST `
  -Path "/v1/jobmitra/employee/career/applications/$applicationId/offer/accept" `
  -Session $employerSession

Assert-Status $rbacCheck.Status 403 "Employer blocked from employee/accept endpoint"

# ─── Step 3: Employer confirms hire ──────────────────────────────────────────

Write-Step "Step 3: Employer confirms hire (gate step 3/3)"

$hireResult = Invoke-Api -Method POST `
  -Path "/v1/jobmitra/employer/career/applications/$applicationId/confirm-hire" `
  -Session $employerSession

Assert-Status $hireResult.Status 200 "Confirm hire"
Assert-NotNull $hireResult.Data.data.employment.id "employment.id"
Assert-Field $hireResult.Data.data.employment "status" "active" "employment.status"
Assert-Field $hireResult.Data.data.employment "employee_user_id" `
  $hireResult.Data.data.employment.employee_user_id "employment.employee_user_id present"
Assert-Field $hireResult.Data.data "alreadyConfirmed" $false "alreadyConfirmed = false (first call)"

# ─── Step 3 (idempotency): Call confirm-hire again ───────────────────────────

Write-Step "Idempotency: Calling confirm-hire a second time"

$hireAgain = Invoke-Api -Method POST `
  -Path "/v1/jobmitra/employer/career/applications/$applicationId/confirm-hire" `
  -Session $employerSession

Assert-Status $hireAgain.Status 200 "Confirm hire (idempotent call)"
Assert-Field $hireAgain.Data.data "alreadyConfirmed" $true "alreadyConfirmed = true (second call)"
Assert-Field $hireAgain.Data.data.employment "id" `
  $hireResult.Data.data.employment.id "Same employment.id returned"

# ─── RBAC check: Employee cannot call employer confirm-hire ──────────────────

Write-Step "RBAC: Employee session rejected on employer endpoints"

$empRbac = Invoke-Api -Method POST `
  -Path "/v1/jobmitra/employer/career/applications/$applicationId/confirm-hire" `
  -Session $employeeSession

Assert-Status $empRbac.Status 403 "Employee blocked from employer/confirm-hire endpoint"

# ─── Summary ─────────────────────────────────────────────────────────────────

Write-Host ""
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  Test Summary" -ForegroundColor Magenta
Write-Host "  PASS: $PassCount   FAIL: $FailCount" -ForegroundColor $(if ($FailCount -eq 0) { "Green" } else { "Red" })
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

if ($FailCount -gt 0) {
  exit 1
} else {
  exit 0
}
