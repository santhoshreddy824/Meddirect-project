# 🚀 MedDirect Render Deployment Automation Script (PowerShell)
# This script helps automate the deployment process to Render

Write-Host "🚀 Starting MedDirect deployment preparation..." -ForegroundColor Blue

function Write-Status {
    param($Message)
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

function Write-Success {
    param($Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param($Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param($Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if git is available
if (!(Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error "Git is not installed. Please install Git first."
    exit 1
}

# Check if we're in a git repository
try {
    git rev-parse --git-dir | Out-Null
}
catch {
    Write-Error "Not in a git repository. Please initialize git first."
    exit 1
}

Write-Status "Checking project structure..."

# Check if required directories exist
$requiredDirs = @("backend", "clientside", "admin")
foreach ($dir in $requiredDirs) {
    if (!(Test-Path $dir)) {
        Write-Error "Directory '$dir' not found. Please ensure you're in the project root."
        exit 1
    }
}

Write-Success "Project structure verified!"

# Check if package.json files exist
$requiredPackages = @("backend\package.json", "clientside\package.json", "admin\package.json")
foreach ($package in $requiredPackages) {
    if (!(Test-Path $package)) {
        Write-Error "File '$package' not found."
        exit 1
    }
}

Write-Success "Package.json files found!"

# Check for environment template files
Write-Status "Checking environment template files..."
$envTemplates = @(
    "backend\.env.production",
    "clientside\.env.production", 
    "admin\.env.production"
)

foreach ($template in $envTemplates) {
    if (!(Test-Path $template)) {
        Write-Warning "Environment template '$template' not found."
    } else {
        Write-Success "Found environment template: $template"
    }
}

# Check if .gitignore exists and has proper entries
Write-Status "Checking .gitignore configuration..."
if (!(Test-Path ".gitignore")) {
    Write-Warning ".gitignore file not found. Creating basic .gitignore..."
    
    $gitignoreContent = @"
# Environment files
.env
.env.local
.env.production
.env.staging

# Dependencies
node_modules/
*/node_modules/

# Build outputs
dist/
build/
*/dist/
*/build/

# Logs
*.log
logs/
*/logs/

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*/coverage/

# Cache directories
.npm
.cache/
*/.cache/

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
"@
    
    $gitignoreContent | Out-File -FilePath ".gitignore" -Encoding UTF8
    Write-Success "Created .gitignore file!"
} else {
    Write-Success ".gitignore file exists!"
}

# Add all changes and commit
Write-Status "Preparing code for deployment..."

# Add all changes
git add .

# Check if there are any changes to commit
$hasChanges = git diff --staged --quiet; $LASTEXITCODE -eq 1

if ($hasChanges) {
    Write-Status "Committing changes..."
    $commitMessage = "Prepare for Render deployment - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    git commit -m $commitMessage
    Write-Success "Changes committed!"
} else {
    Write-Status "No changes to commit."
}

# Push to repository
Write-Status "Pushing to remote repository..."
try {
    git push origin main
    Write-Success "Code pushed to repository!"
}
catch {
    try {
        git push origin master
        Write-Success "Code pushed to repository (master branch)!"
    }
    catch {
        Write-Error "Failed to push to repository. Please check your git configuration."
        exit 1
    }
}

Write-Host ""
Write-Host "🎉 Deployment preparation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Go to https://dashboard.render.com/"
Write-Host "2. Create new Web Service for backend (meddirect-backend)"
Write-Host "3. Create new Static Site for frontend (meddirect-frontend)" 
Write-Host "4. Create new Static Site for admin (meddirect-admin)"
Write-Host "5. Configure environment variables for each service"
Write-Host ""
Write-Host "📚 For detailed instructions, check:" -ForegroundColor Yellow
Write-Host "- README.md (Deployment section)"
Write-Host "- RENDER_DEPLOYMENT_CHECKLIST.md"
Write-Host ""
Write-Host "🔗 Your repository is ready for Render deployment!" -ForegroundColor Green
Write-Host ""

# Display current git remote URL
try {
    $remoteUrl = git config --get remote.origin.url
    if ($remoteUrl) {
        Write-Status "Repository URL: $remoteUrl"
    }
}
catch {
    # Ignore error if remote URL not found
}

Write-Success "All done! 🚀"