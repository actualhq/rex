# Rex

Rex is a multipurpose library providing a wide array of simple utilities for Deno superpowers.

## Usage

Because there's such a wide variety of functionality, functions are broken up into several folders
and files within those folders. Since Deno will only cache and package scripts used by your script,
you can avoid including parts of Rex you don't depend on by only importing individual files instead
of the entire module:

```typescript
import { stripPrefix } from 'https://deno.land/x/rex/lang/strings.ts';
import { $ } from 'https://deno.land/x/rex/shell/run.ts';
```

If you're not particularly concerned about a little bit more bloat, you can import everything you
need from `mod.ts`:

```typescript
import { stripPrefix } from 'https://deno.land/x/rex/mod.ts';
import { $ } from 'https://deno.land/x/rex/mod.ts';
```

## Lodash usage

This library depends on some parts of [Lodash](https://lodash.com/), so if your app also does, you
may end up with multiple versions of the same code. We recommend importing the same
[Skypack](https://www.skypack.dev/) sources that Rex does, which is currently:

`https://cdn.skypack.dev/lodash@v4.17.21/$FUNCTION_NAME?dts`

We recommend importing only the functions you use from individual files, but many Lodash import
styles are supported:

```typescript
// Recommended: Default function imports from individual files:
import isNil from 'https://cdn.skypack.dev/lodash@v4.17.21/isNil?dts';
import clamp from 'https://cdn.skypack.dev/lodash@v4.17.21/clamp?dts';

// Default import of entire packaged library:
import lodash from 'https://cdn.skypack.dev/lodash@v4.17.21?dts';
import _ from 'https://cdn.skypack.dev/lodash@v4.17.21?dts';

// Named function imports from packaged library:
import { isNil } from 'https://cdn.skypack.dev/lodash@v4.17.21?dts';
import { clamp } from 'https://cdn.skypack.dev/lodash@v4.17.21?dts';
```

If you use the same exact Lodash import URLs as Rex, Deno cache should recognize this and skip the
extra downloads. Look in Rex's [deps.ts](./deps.ts) for a list of what Rex uses.

## Roadmap

- Add a detailed listing of all functions and their documentation
- Add common operations for `git` CLI
- Add common operations for GitHub API
- Add common operations for `helm` CLI
- Add common operations for `kubectl` CLI
- Add download function to stream files from internet to local file system
- Add facade function for reading from local files or URLs using the same API
- Add validation for SHA file checksums
- Add functions to alter shell environment (e.g. detect/add to shell rc file and `PATH` variable)
- Add semantic formatting functions for console I/O (e.g. `header`, `paragraph`)
