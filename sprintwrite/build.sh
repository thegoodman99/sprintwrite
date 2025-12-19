#!/bin/bash

# SprintWrite Build Script
# Creates a production-ready ZIP file for Chrome Web Store submission

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   SprintWrite Build Script v2.4.2     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Get version from manifest.json
VERSION=$(grep '"version"' manifest.json | sed 's/.*"version": "\(.*\)".*/\1/')
echo -e "${YELLOW}📦 Building version: ${VERSION}${NC}"

# Create build directory if it doesn't exist
BUILD_DIR="dist"
if [ -d "$BUILD_DIR" ]; then
    echo -e "${YELLOW}🗑️  Cleaning existing build directory...${NC}"
    rm -rf "$BUILD_DIR"
fi

mkdir -p "$BUILD_DIR"

# Create temporary directory for clean copy
TEMP_DIR=$(mktemp -d)
echo -e "${BLUE}📂 Creating temporary build directory...${NC}"

# Copy only production files
echo -e "${BLUE}📋 Copying production files...${NC}"

# Copy directory structure
cp -r background "$TEMP_DIR/"
cp -r common "$TEMP_DIR/"
cp -r content "$TEMP_DIR/"
cp -r icons "$TEMP_DIR/"
cp -r license "$TEMP_DIR/"
cp -r options "$TEMP_DIR/"
cp -r popup "$TEMP_DIR/"

# Copy root files
cp manifest.json "$TEMP_DIR/"
cp README.md "$TEMP_DIR/"
cp CHANGELOG.md "$TEMP_DIR/"
cp PRIVACY.md "$TEMP_DIR/"

echo -e "${GREEN}✓ Files copied${NC}"

# Remove development files
echo -e "${BLUE}🧹 Cleaning up development files...${NC}"

# Remove .DS_Store files
find "$TEMP_DIR" -name ".DS_Store" -delete 2>/dev/null || true

# Remove any .map files
find "$TEMP_DIR" -name "*.map" -delete 2>/dev/null || true

# Remove any test files
find "$TEMP_DIR" -name "*test.js" -delete 2>/dev/null || true
find "$TEMP_DIR" -name "*.test.js" -delete 2>/dev/null || true

# Remove backup files
find "$TEMP_DIR" -name "*.backup" -delete 2>/dev/null || true
find "$TEMP_DIR" -name "*.bak" -delete 2>/dev/null || true

echo -e "${GREEN}✓ Cleanup complete${NC}"

# Create ZIP file
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
ZIP_NAME="sprintwrite-v${VERSION}-${TIMESTAMP}.zip"
# Use absolute path for ZIP file
CURRENT_DIR=$(pwd)
ZIP_PATH="$CURRENT_DIR/$BUILD_DIR/$ZIP_NAME"

echo -e "${BLUE}📦 Creating ZIP archive...${NC}"
cd "$TEMP_DIR"
zip -r "$ZIP_PATH" . -x "*.git*" -x "*.DS_Store" -x "__MACOSX/*" > /dev/null
cd - > /dev/null

# Cleanup temp directory
rm -rf "$TEMP_DIR"

# Get file size
FILE_SIZE=$(du -h "$ZIP_PATH" | cut -f1)

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          BUILD SUCCESSFUL! ✓           ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Package Details:${NC}"
echo -e "  📦 File: ${BLUE}${ZIP_NAME}${NC}"
echo -e "  📁 Location: ${BLUE}${ZIP_PATH}${NC}"
echo -e "  📊 Size: ${BLUE}${FILE_SIZE}${NC}"
echo -e "  🏷️  Version: ${BLUE}${VERSION}${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo -e "  1. Test the extension by loading ${BLUE}${ZIP_PATH}${NC} in Chrome"
echo -e "  2. Go to ${BLUE}chrome://extensions/${NC}"
echo -e "  3. Enable ${BLUE}Developer mode${NC}"
echo -e "  4. Click ${BLUE}Load unpacked${NC} and select the extracted folder"
echo -e "  5. Test all features thoroughly"
echo -e "  6. Upload to Chrome Web Store Developer Dashboard"
echo ""
echo -e "${GREEN}Ready for Chrome Web Store submission! 🚀${NC}"
echo ""
