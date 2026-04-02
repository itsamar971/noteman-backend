#!/bin/bash

# This script starts the application in production mode for Render

# Set environment variables if not already set
export NODE_ENV=production

# Make sure the database is set up
npx drizzle-kit push

# Start the application
node dist/index.js