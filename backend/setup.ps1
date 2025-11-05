# Quick Backend Setup Script for MedDirect (PowerShell)
Write-Host "🔧 MedDirect Backend Quick Setup" -ForegroundColor Blue
Write-Host "=================================" -ForegroundColor Blue

# Check if .env exists
if (!(Test-Path ".env")) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "📋 Creating .env from template..." -ForegroundColor Yellow
    
    # Copy from .env.dev template
    if (Test-Path ".env.dev") {
        Copy-Item ".env.dev" ".env"
        Write-Host "✅ Created .env file from template" -ForegroundColor Green
    } else {
        Write-Host "❌ Template file .env.dev not found" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ .env file exists" -ForegroundColor Green
}

# Check MongoDB URI
$envContent = Get-Content ".env" -Raw
if ($envContent -match "MONGODB_URI=(.+)") {
    $mongoUri = $matches[1].Trim()
    if ($mongoUri -like "*yourusername:yourpassword*" -or $mongoUri -like "*username:password*") {
        Write-Host ""
        Write-Host "⚠️  WARNING: MongoDB URI is still using placeholder values!" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "🔧 TO FIX:" -ForegroundColor Cyan
        Write-Host "1. Create MongoDB Atlas account: https://cloud.mongodb.com/"
        Write-Host "2. Create a cluster and get your connection string"
        Write-Host "3. Edit .env file and replace MONGODB_URI with your actual connection string"
        Write-Host ""
        Write-Host "Example:"
        Write-Host "MONGODB_URI=mongodb+srv://myuser:mypass@cluster0.abc123.mongodb.net/meddirect"
        Write-Host ""
    } else {
        Write-Host "✅ MongoDB URI appears to be configured" -ForegroundColor Green
    }
}

# Check JWT Secret
if ($envContent -match "JWT_SECRET=(.+)") {
    $jwtSecret = $matches[1].Trim()
    if ($jwtSecret -eq "your_jwt_secret_here" -or $jwtSecret.Length -lt 20) {
        Write-Host "⚠️  WARNING: JWT_SECRET needs to be updated with a secure random string" -ForegroundColor Yellow
    } else {
        Write-Host "✅ JWT_SECRET appears to be configured" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "🚀 NEXT STEPS:" -ForegroundColor Green
Write-Host "1. Update your MongoDB URI in .env file"
Write-Host "2. Run: npm install"
Write-Host "3. Run: npm run dev"
Write-Host ""
Write-Host "📖 For detailed setup instructions, see: SETUP_GUIDE.md" -ForegroundColor Cyan