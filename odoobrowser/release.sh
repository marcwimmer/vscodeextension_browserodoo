#!/bin/bash
set -e
cd "$(dirname "$0")"

if [ ! -f zebroo.vsix ]; then
    echo "No zebroo.vsix found. Run ./build_and_install.sh first."
    exit 1
fi

VERSION=$(node -p "require('./package.json').version")
TAG="v${VERSION}"

gh release delete "$TAG" --yes 2>/dev/null || true
gh release create "$TAG" zebroo.vsix --title "$TAG" --notes "Zebroo VSCode extension $TAG" --latest

echo "Released $TAG to GitHub."
