#!/bin/bash

# Render build script for MedDirect backend
echo "🚀 Starting MedDirect backend build on Render..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run any database migrations or seeds if needed
echo "🗃️ Setting up database..."
# Uncomment the line below if you want to seed the database on deployment
# npm run seed

echo "✅ Backend build completed successfully!"