import { Stats } from "fs";
import * as fs from "fs/promises";
import * as pt from "path";
import { getStatSafe } from "./utils";

type RenameArgs = [
  startPath: string,
  renameMatch: string,
  includeMatch: string,
  excludeMatch: string
];

const actualArgs = process.argv.slice(2) as RenameArgs;

console.debug(actualArgs);

function assertStats(s: Stats | null): asserts s is Stats {
  s !== null;
}

const rename = async (
  ...[startPath, renameMatch, includeMatch, excludeMatch]: RenameArgs
) => {
  const { error, stats } = await getStatSafe(startPath);

  if (error !== null) {
    console.error(error);
    process.exit();
  }

  assertStats(stats);

  if (stats.isFile()) {
    console.warn("path is a file, using directory name");
    startPath = pt.dirname(startPath);
  }

  const dirents = await fs.readdir(startPath, {
    withFileTypes: true,
    encoding: "utf8",
  });

  const includeRegExp = includeMatch ? new RegExp(includeMatch, "g") : null;
  const excludeRegExp = excludeMatch ? new RegExp(excludeMatch, "g") : null;

  const renamePromises = dirents
    .filter(({ name }) => {
      const fullPath = pt.resolve(startPath, name);
      return excludeRegExp ? !excludeRegExp.test(fullPath) : true;
    })
    .map(async (dirent) => {
      const { name } = dirent;

      const fullPath = pt.resolve(startPath, name);

      if (dirent.isDirectory()) {
        return rename(fullPath, renameMatch, includeMatch, excludeMatch);
      }

      const shouldRename = includeRegExp ? includeRegExp.test(fullPath) : true;

      if (dirent.isFile() && shouldRename) {
        return fs.rename(
          fullPath,
          fullPath.replace(includeRegExp || fullPath, renameMatch)
        );
      }
    });

  await Promise.all(renamePromises);
};

rename(...actualArgs);
