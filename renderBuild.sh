#!/bin/bash

# This script helps build the application for Render deployment

# Ensure the database exists
npm run db:push

# Build the frontend and backend
npm run build

# Make sure the build directory structure matches what server expects
if [ -d "dist/public" ] && [ ! -d "dist/client" ]; then
  echo "Fixing build directory structure for Render..."
  mkdir -p dist/client
  cp -R dist/public/* dist/client/
  # Also copy to root dist directory as fallback
  cp -R dist/public/* dist/
fi

# Output build information
echo "Build completed successfully!"
echo "Make sure your Render deployment:"
echo "1. Uses 'npm start' as the start command"
echo "2. Has the DATABASE_URL environment variable set"
echo "3. Has the NODE_ENV=production environment variable set"
echo "4. Uses this build script before starting the app"