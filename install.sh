#!/bin/bash
# Quick installation script for Quadrate VSCode extension

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "==================================="
echo "  Quadrate VSCode Extension Setup"
echo "==================================="
echo ""

# Check for npm
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed"
    echo "Please install Node.js and npm first"
    exit 1
fi

# Check for quadlsp
if ! command -v quadlsp &> /dev/null; then
    echo "Warning: quadlsp not found in PATH"
    echo "Please run 'make install' from the quadrate repo root"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Install dependencies
echo "Installing npm dependencies..."
npm install

# Compile TypeScript
echo "Compiling TypeScript..."
npm run compile

# Detect VSCode/VSCodium
CODE_CMD=""
if command -v code &> /dev/null; then
    CODE_CMD="code"
    EDITOR_NAME="VSCode"
elif command -v codium &> /dev/null; then
    CODE_CMD="codium"
    EDITOR_NAME="VSCodium"
else
    echo ""
    echo "Error: Could not find 'code' or 'codium' command"
    echo "Is VSCode/VSCodium installed and in PATH?"
    exit 1
fi

# Package extension
echo "Packaging extension..."
npx @vscode/vsce package --baseContentUrl "https://git.sr.ht/~klahr/quadrate-vscode/blob/master" -o quadrate.vsix

# Install extension
echo ""
echo "Installing extension to $EDITOR_NAME..."
$CODE_CMD --install-extension quadrate.vsix --force

# Clean up
rm -f quadrate.vsix

echo ""
echo "==================================="
echo "  Installation Complete!"
echo "==================================="
echo ""
echo "Next steps:"
echo "1. Reload $EDITOR_NAME (Ctrl+Shift+P → 'Developer: Reload Window')"
echo "2. Open a .qd file"
echo "3. Verify syntax highlighting and LSP features work"
