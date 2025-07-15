#!/bin/bash

# Build script for Render.com deployment
echo "Starting build process..."

# Set environment variables to avoid interactive prompts
export DEBIAN_FRONTEND=noninteractive

# Update package list with retries
echo "Updating package list..."
for i in {1..3}; do
    if apt-get update; then
        break
    else
        echo "Package update attempt $i failed, retrying..."
        sleep 5
    fi
done

# Install LibreOffice for PDF conversion
echo "Installing LibreOffice..."
apt-get install -y --no-install-recommends libreoffice-writer libreoffice-common

# Install Python dependencies
echo "Installing Python dependencies..."
cd backend
pip install --no-cache-dir -r requirements.txt

echo "Build completed successfully!"
