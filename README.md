# Renamer

Quick utility script to recursively rename all files matching a pattern.

# Usage

Initial version is launched directly from TypeScript source and thus has `typescript` and `ts-node` bundled in (subject to change).

Currently the module is run as a CLI program, there is no exposed API for use in scripts.

```shell
$ ts-node index.ts \
    "<path to start from>" \
    "<RegExp string for renaming>" \
    "[RegExp string for files to include]" \
    "[RegExp string for files to omit]"
```

The following example renames all `.tsx` files starting from the current working directory into `.ts` except when the file is starting with `index`:

```shell
$ ts-node index.ts . "\$1.ts" "(.*)\\.tsx" "index*"
```
