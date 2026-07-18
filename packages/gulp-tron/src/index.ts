/**
 * gulp-tron
 */

import { Tron } from "./tron.js";

const tron = new Tron();

export * from "./build-stream.js";
export { gulp } from "./globals.js";
export * from "./tron.js";
export * from "./types.js";
export * from "./utils/index.js";
export { tron };
export default tron;
