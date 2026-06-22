#!/bin/bash

# ShelfSwap Frontend Deployment Script for Cloudflare Pages
# Builds and deploys the frontend to Cloudflare Pages using Wrangler.
#
# Usage:
#   ./deploy-frontend.sh         Interactive local deploy (opens browser to log in)
#   ./deploy-frontend.sh --ci    Non-interactive deploy for CI/CD pipelines
#
# CI mode requires these environment variables (set them as CI secrets):
#   CLOUDFLARE_API_TOKEN          API token with the "Cloudflare Pages: Edit" permission
#   CLOUDFLARE_ACCOUNT_ID         Your Cloudflare account ID
#   VITE_CLERK_PUBLISHABLE_KEY    Clerk publishable key, baked into the build

set -euo pipefail

# Colors for output (auto-disabled when not attached to a terminal, e.g. CI logs)
if [ -t 1 ]; then
    RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
else
    RED=''; GREEN=''; YELLOW=''; NC=''
fi

PROJECT_NAME="shelfswap"
OUTPUT_DIR="dist"
# Pin Wrangler so local and CI deploys use the exact same version.
WRANGLER="npx --yes wrangler@4"

# Enable CI mode via the --ci flag or a CI=true environment variable.
CI_MODE=false
if [ "${1:-}" = "--ci" ] || [ "${CI:-}" = "true" ]; then
    CI_MODE=true
fi

echo -e "${GREEN}🚀 ShelfSwap Frontend Deployment${NC}"
echo "=================================="

# ---------------------------------------------------------------------------
# Phase 1/3: Authentication
# ---------------------------------------------------------------------------
if [ "$CI_MODE" = true ]; then
    echo -e "${YELLOW}Phase 1/3: Verifying CI credentials...${NC}"
    missing=""
    [ -z "${CLOUDFLARE_API_TOKEN:-}" ] && missing="$missing CLOUDFLARE_API_TOKEN"
    [ -z "${CLOUDFLARE_ACCOUNT_ID:-}" ] && missing="$missing CLOUDFLARE_ACCOUNT_ID"
    [ -z "${VITE_CLERK_PUBLISHABLE_KEY:-}" ] && missing="$missing VITE_CLERK_PUBLISHABLE_KEY"
    if [ -n "$missing" ]; then
        echo -e "${RED}Error: missing required environment variable(s):${missing}${NC}"
        exit 1
    fi
    # Wrangler reads CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID from the environment.
else
    echo -e "${YELLOW}Phase 1/3: Authenticating with Cloudflare...${NC}"
    if ! $WRANGLER whoami &> /dev/null; then
        echo -e "${YELLOW}Not logged in. Opening browser to authenticate...${NC}"
        $WRANGLER login
    fi
fi

# ---------------------------------------------------------------------------
# Phase 2/3: Build
# ---------------------------------------------------------------------------
echo -e "${YELLOW}Phase 2/3: Building frontend...${NC}"
npm run build

# ---------------------------------------------------------------------------
# Phase 3/3: Deploy
# ---------------------------------------------------------------------------
echo -e "${YELLOW}Phase 3/3: Deploying to Cloudflare Pages...${NC}"
$WRANGLER pages deploy "$OUTPUT_DIR" \
    --project-name="$PROJECT_NAME" \
    --branch=main \
    --commit-dirty=true

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo "=================================="
