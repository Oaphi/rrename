import { exec } from "child_process";
import { BaseEncodingOptions } from "fs";
import { appendFile, mkdir } from "fs/promises";
import * as pt from "path";
import * as rimraf from "rimraf";
import { promisify } from "util";
import { v4 } from "uuid";
import { getStatSafe } from "../utils";

const asyncExec = promisify(exec);
const asyncRimraf = promisify<string, rimraf.Options>(rimraf);

const base = "./tests"; //import.meta.url doesn't work with ts-jest yet: https://github.com/kulshekhar/ts-jest/issues/1174

const recursiveAppend = async (
  path: string,
  encoding: BaseEncodingOptions["encoding"] = "utf-8"
) => {
  const parts = path.split(pt.sep);

  const lastPart = parts.pop();

  if (!lastPart) return;

  const onlyDirs = pt.parse(lastPart).ext === "";

  if (onlyDirs) parts.push(lastPart);

  await mkdir(parts.join(pt.sep), { recursive: true });

  if (!onlyDirs) {
    await appendFile(path, "", { encoding });
  }
};

const createFiles = async (
  base: string,
  paths: string[],
  encoding: BaseEncodingOptions["encoding"] = "utf-8"
) => {
  await Promise.all(
    paths.map((path) => recursiveAppend(pt.resolve(base, path), encoding))
  );
};

const execRenamer = async (
  base: string,
  target: string,
  include: string,
  exclude?: string
) =>
  await asyncExec(
    `ts-node index.ts ${base} "${target}" "${include}" ${
      exclude ? `"${exclude}"` : ""
    }`
  );

describe("Renamer", () => {
  beforeAll(async () => {
    await asyncRimraf(`${base}/**/!(*.test.?s)`, {});
  });

  test("renames file if start, rename and include opts provided", async () => {
    const filenames = ["quantifiers/all/info.md"];

    await createFiles(base, filenames);

    const dt = new Date().toISOString().slice(0, 10);

    const included = "(.*)\\.md",
      target = `$1_${dt}.md`;

    await execRenamer(base, target, included);

    const { stdout } = await asyncExec(
      `[ \$(ls -la ${base}/${
        pt.parse(filenames[0]).dir
      } | grep info) ] && echo 1 || echo ""`
    );

    expect(stdout).not.toEqual("");
  });

  test("renames files recursively", async () => {
    const filenames = ["a/b/c/eva.mpg", "a/b/rey.png"];

    await createFiles(base, filenames);

    const included = "(eva|rey)",
      target = "Evangelion ($1)";

    await execRenamer(base, target, included);

    const { stdout } = await asyncExec(
      `find ${base} -name "Evangelion (eva)*"`
    );

    expect(stdout).not.toEqual("");
  });

  test("ignores files if ignore opt provided", async () => {
    const filenames = ["john_doe.info", "john_dillinger.info"];

    await createFiles(base, filenames);

    const included = "john.*",
      target = `${v4()}.info`,
      excluded = "doe";

    await execRenamer(base, target, included, excluded);

    const { error } = await getStatSafe(pt.resolve(base, target));

    expect(error).toBe(null);
  });

  afterAll(async () => {
    await asyncRimraf(`${base}/**/!(*.test.?s)`, {});
  });
});
