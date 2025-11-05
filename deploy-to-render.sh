#!/bin/bash

# 🚀 MedDirect Render Deployment Automation Script
# This script helps automate the deployment process to Render

echo "🚀 Starting MedDirect deployment preparation..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if git is available
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git first."
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not in a git repository. Please initialize git first."
    exit 1
fi

print_status "Checking project structure..."

# Check if required directories exist
required_dirs=("backend" "clientside" "admin")
for dir in "${required_dirs[@]}"; do
    if [ ! -d "$dir" ]; then
        print_error "Directory '$dir' not found. Please ensure you're in the project root."
        exit 1
    fi
done

print_success "Project structure verified!"

# Check if package.json files exist
required_packages=("backend/package.json" "clientside/package.json" "admin/package.json")
for package in "${required_packages[@]}"; do
    if [ ! -f "$package" ]; then
        print_error "File '$package' not found."
        exit 1
    fi
done

print_success "Package.json files found!"

# Check for environment template files
print_status "Checking environment template files..."
env_templates=(
    "backend/.env.production"
    "clientside/.env.production" 
    "admin/.env.production"
)

for template in "${env_templates[@]}"; do
    if [ ! -f "$template" ]; then
        print_warning "Environment template '$template' not found."
    else
        print_success "Found environment template: $template"
    fi
done

# Check if .gitignore exists and has proper entries
print_status "Checking .gitignore configuration..."
if [ ! -f ".gitignore" ]; then
    print_warning ".gitignore file not found. Creating basic .gitignore..."
    cat > .gitignore << EOL
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
EOL
    print_success "Created .gitignore file!"
else
    print_success ".gitignore file exists!"
fi

# Add all changes and commit
print_status "Preparing code for deployment..."

# Add all changes
git add .

# Check if there are any changes to commit
if git diff --staged --quiet; then
    print_status "No changes to commit."
else
    print_status "Committing changes..."
    git commit -m "Prepare for Render deployment - $(date '+%Y-%m-%d %H:%M:%S')"
    print_success "Changes committed!"
fi

# Push to repository
print_status "Pushing to remote repository..."
if git push origin main; then
    print_success "Code pushed to repository!"
else
    if git push origin master; then
        print_success "Code pushed to repository (master branch)!"
    else
        print_error "Failed to push to repository. Please check your git configuration."
        exit 1
    fi
fi

echo ""
echo "🎉 Deployment preparation complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Go to https://dashboard.render.com/"
echo "2. Create new Web Service for backend (meddirect-backend)"
echo "3. Create new Static Site for frontend (meddirect-frontend)" 
echo "4. Create new Static Site for admin (meddirect-admin)"
echo "5. Configure environment variables for each service"
echo ""
echo "📚 For detailed instructions, check:"
echo "- README.md (Deployment section)"
echo "- RENDER_DEPLOYMENT_CHECKLIST.md"
echo ""
echo "🔗 Your repository is ready for Render deployment!"
echo ""

# Display current git remote URL
remote_url=$(git config --get remote.origin.url)
if [ ! -z "$remote_url" ]; then
    print_status "Repository URL: $remote_url"
fi

print_success "All done! 🚀"