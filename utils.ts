import * as fs from "fs/promises";
import type { MaybeStats } from "./types";

const nullifyEmpty = <T>(obj: T, mightBeMissing: (keyof T)[] = []) => {
  const hop = Object.prototype.hasOwnProperty;

  for (const key in obj) {
    if (hop.call(obj, key) && obj[key] === void 0) {
      obj[key] = (null as unknown) as T[typeof key]; //@see: https://stackoverflow.com/a/56927160/11407695
    }
  }

  mightBeMissing.forEach((key) => {
    obj[key] !== void 0 || (obj[key] = (null as unknown) as T[keyof T]);
  });

  return obj;
};

export const getStatSafe = async (path: string) => {
  const output = {} as MaybeStats;

  try {
    output.stats = await fs.stat(path);
  } catch (error) {
    const { code } = error as Required<NodeJS.ErrnoException>;

    console.debug(error);

    output.error = code;
  }

  return nullifyEmpty(output, ["error", "stats"]);
};
