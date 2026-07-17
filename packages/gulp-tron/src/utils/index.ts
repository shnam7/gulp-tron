import process from "node:process";

export { default as is } from "@wicle/is";
export * from "./arrayify.js";
export * from "./copy.js";
export * from "./exec.js";

export async function flushStdout() {
  return new Promise<void>((resolve) => {
    if (process.stdout.writableLength === 0) {
      resolve();
    } else {
      process.stdout.once("drain", resolve);
    }
  });
}

export async function flushStderr() {
  return new Promise<void>((resolve) => {
    if (process.stderr.writableLength === 0) {
      resolve();
    } else {
      process.stderr.once("drain", resolve);
    }
  });
}

export async function flushAllStdio() {
  await Promise.all([flushStdout(), flushStderr()]);
}

export async function timer(msec: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, msec);
  });
}

export async function delay(msec: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, msec);
  });
}
