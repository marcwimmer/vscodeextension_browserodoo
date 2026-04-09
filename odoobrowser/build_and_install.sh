#!/bin/bash
set -e
cd "$(dirname "$0")"

# Build
vsce package --out zebroo.vsix

# Install locally in all available VS Code variants
for cmd in code code-insiders codium; do
    if command -v "$cmd" &>/dev/null; then
        "$cmd" --uninstall-extension MarcWimmerITE.odoobrowserITE 2>/dev/null && echo "Removed old odoobrowser from $cmd"
        echo "Installing in $cmd..."
        "$cmd" --install-extension zebroo.vsix --force
    fi
done

echo "Done. Restart VS Code to activate."
echo "To publish: ./release.sh"
