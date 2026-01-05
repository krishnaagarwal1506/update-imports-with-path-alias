# update-imports-with-path-alias

An NPX tool that automatically updates import paths in TypeScript and JavaScript projects to use path aliases defined in your `tsconfig.json`.

## What does it do?

When you add path aliases to your `tsconfig.json`, this tool will scan all your source files and replace relative imports with the new aliased imports.

## Features

- 🚀 **Zero installation** - Run directly with npx
- 📁 **Auto-discovery** - Works with your existing `tsconfig.json`
- 🔄 **Smart replacement** - Converts relative imports to path aliases
- 🎯 **Precise targeting** - Only updates imports that match your aliases
- 💾 **Safe operation** - Preserves query parameters and hash fragments
- 📦 **Multi-format support** - Works with `.ts`, `.tsx`, `.js`, `.jsx` files

## Quick Start

1. **Add path aliases** to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@utils/*": ["./src/utils/*"]
    }
  }
}
```

2. **Run the tool** in your project root:

```bash
npx update-imports-with-path-alias
```

That's it! All your imports will be updated automatically.

## Usage

### Basic Usage

```bash
# Run from your project root directory
npx update-imports-with-path-alias
```

### Typical Workflow

1. Set up path aliases in your `tsconfig.json`
2. Run the tool to update all existing imports
3. Continue developing with your new path aliases

## How It Works

1. 📖 Reads your project's `tsconfig.json`
2. 🔍 Extracts path aliases from `compilerOptions.paths`
3. 📂 Scans all `.ts`, `.tsx`, `.js`, `.jsx` files in `src/`
4. 🔄 Replaces relative imports with matching path aliases
5. ✅ Reports which files were updated

## Example Transformation

**Before (relative imports):**

```typescript
// src/components/Button/Button.tsx
import { validateEmail } from "../../../utils/validation";
import { Modal } from "../../Modal/Modal";
import { Icon } from "../Icon/Icon";
```

**After (path aliases):**

```typescript
// src/components/Button/Button.tsx
import { validateEmail } from "@/utils/validation";
import { Modal } from "@/components/Modal/Modal";
import { Icon } from "@/components/Icon/Icon";
```

## Requirements

- **Node.js** 14 or higher
- **tsconfig.json** file in your project root with `paths` configured
- **src directory** containing your source files
- TypeScript or JavaScript project

## Why Use This Tool?

### Before Path Aliases

```typescript
import { Button } from "../../../components/ui/Button";
import { useAuth } from "../../../../hooks/useAuth";
import { ApiClient } from "../../../../../services/api";
```

### After Path Aliases

```typescript
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { ApiClient } from "@/services/api";
```

**Benefits:**

- ✅ Shorter, cleaner imports
- ✅ Less prone to breaking when moving files
- ✅ Easier to read and understand
- ✅ Better IDE autocomplete support

## Troubleshooting

**No files updated?**

- Ensure your `tsconfig.json` has `paths` configured
- Check that you have a `src/` directory with source files
- Verify you're running the command from your project root

**Imports not working after update?**

- Make sure your bundler/compiler supports TypeScript path aliases
- For Webpack, you may need to configure resolve aliases
- For Vite, path aliases should work out of the box

## Contributing

Contributions are welcome! This tool is designed to be simple and focused.

## License

MIT License - feel free to use in your projects!

---

**💡 Tip**: Run this tool whenever you add new path aliases to your tsconfig.json to keep your imports consistent!
