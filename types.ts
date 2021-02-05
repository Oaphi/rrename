import { Stats } from "fs";

export type OneNotNull<T, K extends keyof T> = {
  [P in keyof T]: P extends K ? T[P] : null;
};

export type SomeNotNull<T> = {
  [P in keyof T]: OneNotNull<T, P>;
}[keyof T];

export type MaybeStats = SomeNotNull<{ stats: Stats; error: string }>;