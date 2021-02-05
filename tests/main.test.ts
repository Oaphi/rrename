import { exec } from "child_process";
import { appendFile, stat } from "fs/promises";
import * as rimraf from "rimraf";
import { promisify } from "util";

const asyncExec = promisify(exec);
const asyncRimraf = promisify<string, rimraf.Options>(rimraf);

const base = "./tests"; //import.meta.url doesn't work with ts-jest yet: https://github.com/kulshekhar/ts-jest/issues/1174

describe("Renamer", () => {
  test("accepts files & folders as start path", () => {});

  test("renames file if start, rename and include opts provided", () => {});

  test("renames files recursively", () => {});

  test("ignores files if ignore opt provided", async () => {
    const filenames = ["john_doe.info", "john_dillinger.info"];

    await Promise.all(
      filenames.map((p) => appendFile(p, "", { encoding: "utf-8" }))
    );

    const from = "john*.info",
      to = "jean.info",
      ignored = "*doe*";

    await asyncExec(`ts-node ${base} "${to}" "${from}" "${ignored}"`);

    expect()
  });

  afterAll(async () => {
    jest.resetAllMocks();
    await asyncRimraf(`${base}/**/!(*.test.?s)`, {});
  });
});
