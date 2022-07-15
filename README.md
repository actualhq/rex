# rex

Simple utilities for Deno superpowers

## Usage

To use this library, import individual functions from the respective files. Because there's such a
wide variety of functionality, it's broken up into several folders and files within those folders.

For example:

```typescript
import { isNil } from 'https://deno.land/x/rex/lang/values.ts';
```

Or:

```typescript
import { $ } from 'https://deno.land/x/rex/shell/run.ts';
```

## TODOs

- Improve documentation quality
- Remove functionality that overlaps with `lodash` when we find a stable way to recommend use of
  `lodash` in Deno with correct typings
- Add functionality
  - Downloading and reading files from the internet
  - Working with common services (`git`, GitHub API, Helm, `kubectl`, etc.)
  - Validating file checksums
  - Altering shell environments (e.g. add to shell rc file, add to `PATH` variable)
  - Formatting output and getting structured user input
