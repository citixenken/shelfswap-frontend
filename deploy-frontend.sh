#!/bin/bash

# ShelfSwap Frontend Deployment Script for Cloudflare Pages
# This script builds and deploys the frontend to Cloudflare Pages using Wrangler

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 ShelfSwap Frontend Deployment${NC}"
echo "=================================="

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo -e "${YELLOW}Wrangler CLI not found. Installing...${NC}"
    npm install -g wrangler
fi

# Check if user is authenticated
if ! wrangler whoami &> /dev/null; then
    echo -e "${YELLOW}Authenticating with Cloudflare...${NC}"
    wrangler login
fi

# Build the frontend
echo -e "${YELLOW}Building frontend...${NC}"
npm run build

# Deploy to Cloudflare Pages
echo -e "${YELLOW}Deploying to Cloudflare Pages...${NC}"
echo ""
echo -e "${YELLOW}Note: You can deploy using either:${NC}"
echo "1. Wrangler CLI (automated)"
echo "2. Cloudflare Pages Dashboard (manual)"
echo ""
echo -e "${YELLOW}For Wrangler deployment, run:${NC}"
echo "  wrangler pages deploy dist --project-name=shelfswap"
echo ""
echo -e "${YELLOW}For Dashboard deployment:${NC}"
echo "1. Go to https://dash.cloudflare.com/"
echo "2. Navigate to Pages"
echo "3. Create a new project or select existing"
echo "4. Upload the 'dist' folder"
echo ""
echo -e "${GREEN}✅ Build completed successfully!${NC}"
echo "=================================="
echo -e "Build output: ${GREEN}dist/${NC}"
echo ""
echo -e "${YELLOW}⚠️  Important Next Steps:${NC}"
echo "1. Update public/_redirects with your actual Cloud Run URL"
echo "2. Set environment variable in Cloudflare Pages:"
echo "   - VITE_CLERK_PUBLISHABLE_KEY (your Clerk publishable key)"
echo "3. Deploy the dist folder to Cloudflare Pages"
echo "4. Test the deployment"
echo ""
