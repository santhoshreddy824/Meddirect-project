#!/bin/bash

# Quick Backend Setup Script for MedDirect
echo "🔧 MedDirect Backend Quick Setup"
echo "================================="

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "📋 Creating .env from template..."
    
    # Copy from .env.dev template
    if [ -f ".env.dev" ]; then
        cp .env.dev .env
        echo "✅ Created .env file from template"
    else
        echo "❌ Template file .env.dev not found"
        exit 1
    fi
else
    echo "✅ .env file exists"
fi

# Check MongoDB URI
MONGODB_URI=$(grep "MONGODB_URI=" .env | cut -d '=' -f2)
if [[ "$MONGODB_URI" == *"yourusername:yourpassword"* ]] || [[ "$MONGODB_URI" == *"username:password"* ]]; then
    echo ""
    echo "⚠️  WARNING: MongoDB URI is still using placeholder values!"
    echo ""
    echo "🔧 TO FIX:"
    echo "1. Create MongoDB Atlas account: https://cloud.mongodb.com/"
    echo "2. Create a cluster and get your connection string"
    echo "3. Edit .env file and replace MONGODB_URI with your actual connection string"
    echo ""
    echo "Example:"
    echo "MONGODB_URI=mongodb+srv://myuser:mypass@cluster0.abc123.mongodb.net/meddirect"
    echo ""
else
    echo "✅ MongoDB URI appears to be configured"
fi

# Check JWT Secret
JWT_SECRET=$(grep "JWT_SECRET=" .env | cut -d '=' -f2)
if [[ "$JWT_SECRET" == "your_jwt_secret_here" ]] || [ ${#JWT_SECRET} -lt 20 ]; then
    echo "⚠️  WARNING: JWT_SECRET needs to be updated with a secure random string"
else
    echo "✅ JWT_SECRET appears to be configured"
fi

echo ""
echo "🚀 NEXT STEPS:"
echo "1. Update your MongoDB URI in .env file"
echo "2. Run: npm install"
echo "3. Run: npm run dev"
echo ""
echo "📖 For detailed setup instructions, see: SETUP_GUIDE.md"