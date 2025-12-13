# quadrate-vscode

> **Canonical repository:** https://git.sr.ht/~klahr/quadrate-vscode

Code - OSS / Visual Studio Code for the [Quadrate](https://git.sr.ht/~klahr/quadrate) programming language.

---

## Features

- **Syntax Highlighting**: Full TextMate grammar for `.qd` files
- **LSP Integration**: Language server support via quadlsp
- **Auto-completion**: Built-in instructions and user-defined functions
- **Diagnostics**: Real-time error and warning detection
- **Go to Definition**: Navigate to function and variable definitions
- **Find References**: Find all usages of a symbol
- **Rename Symbol**: Scoped renaming of variables and functions
- **Document Formatting**: Format code on demand
- **Hover Documentation**: View function signatures and documentation
- **Signature Help**: Function signatures while typing
- **Document Highlight**: Highlight other occurrences of symbol under cursor
- **Code Folding**: Fold functions and blocks
- **Debugging**: GDB/LLDB integration via cppdbg

---

## Prerequisites

### Required

**quadlsp** binary from the Quadrate compiler:

```bash
git clone https://git.sr.ht/~klahr/quadrate
cd quadrate
make release && sudo make install
```

Or use a local build:
```bash
make debug
# Binary at: build/debug/cmd/quadlsp/quadlsp
```

### Build Requirements

- Node.js and npm

---

## Installation

### Quick Install

```bash
git clone https://git.sr.ht/~klahr/quadrate-vscode
cd quadrate-vscode
./install.sh
```

The install script will:
1. Install npm dependencies
2. Compile TypeScript
3. Symlink the extension to your VS Code extensions directory

### Manual Install

1. **Clone and build:**

```bash
git clone https://git.sr.ht/~klahr/quadrate-vscode
cd quadrate-vscode
npm install
npm run compile
```

2. **Install the extension:**

Option A - Symlink (recommended for development):
```bash
# For VS Code
ln -s "$(pwd)" ~/.vscode/extensions/quadrate-0.1.0

# For VSCodium
ln -s "$(pwd)" ~/.vscode-oss/extensions/quadrate-0.1.0
```

Option B - Package and install:
```bash
npm install -g vsce
vsce package
code --install-extension quadrate-0.1.0.vsix
```

3. **Reload VS Code** (Ctrl+Shift+P -> "Developer: Reload Window")

---

## Configuration

### Settings

Add to your VS Code `settings.json`:

```json
{
  "quadrate.lsp.path": "quadlsp",
  "quadrate.lint.enabled": true,
  "quadrate.lint.path": "quadlint"
}
```

### Using a Local Build

```json
{
  "quadrate.lsp.path": "/path/to/quadrate/build/debug/cmd/quadlsp/quadlsp"
}
```

---

## Debugging Quadrate Programs

The extension includes debugging support via the C/C++ debugger.

### Setup

1. Install the [C/C++ extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode.cpptools)

2. Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Quadrate",
      "type": "quadrate",
      "request": "launch",
      "program": "${workspaceFolder}/${fileBasenameNoExtension}_debug",
      "args": [],
      "stopAtEntry": false,
      "cwd": "${workspaceFolder}",
      "preLaunchTask": "quadrate: build-debug"
    }
  ]
}
```

3. Compile with debug symbols and run:
   - Press F5 to build with `-g` flag and start debugging
   - Set breakpoints in your `.qd` files
   - Step through code, inspect variables

---

## Key Bindings

Default VS Code LSP key bindings apply:

| Key | Action |
|-----|--------|
| `F12` | Go to definition |
| `Shift+F12` | Find references |
| `F2` | Rename symbol |
| `Ctrl+Space` | Trigger completion |
| `Ctrl+Shift+Space` | Trigger signature help |
| `Shift+Alt+F` | Format document |
| `Ctrl+.` | Quick fix / code actions |

---

## Tasks

The extension provides built-in tasks:

- **quadrate: build-debug** - Compile current file with debug symbols

Access via: Terminal -> Run Task -> quadrate

---

## Troubleshooting

### LSP Not Starting

1. Check if quadlsp is in PATH:
```bash
which quadlsp
```

2. Check Output panel: View -> Output -> Quadrate Language Server

3. Verify extension is loaded: Extensions panel should show "Quadrate"

### No Syntax Highlighting

1. Ensure file has `.qd` extension
2. Check language mode in status bar (should show "Quadrate")
3. Try: Ctrl+Shift+P -> "Change Language Mode" -> "Quadrate"

### Completions Not Working

1. Verify LSP is running (check Output panel)
2. Try manual trigger: Ctrl+Space
3. Check that cursor is in a valid position

---

## Development

### Building

```bash
npm install
npm run compile
```

### Watching for Changes

```bash
npm run watch
```

### Packaging

```bash
npm install -g vsce
vsce package
```

---

## Contributing

Patches welcome!

**Email**: ~klahr/quadrate@lists.sr.ht
**GitHub**: https://github.com/quadrate-lang/quadrate-vscode

---

## License

GNU General Public License v3.0

See [LICENSE](./LICENSE) for full terms.

---

## Resources

- **Quadrate Language**: https://git.sr.ht/~klahr/quadrate
- **Documentation**: https://quad.r8.rs
- **VS Code Extension API**: https://code.visualstudio.com/api
