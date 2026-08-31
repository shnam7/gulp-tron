import gulp from "gulp";

let _gulpInstance = gulp;

export function useGulp(gulpInstance: typeof gulp) {
  _gulpInstance = gulpInstance;
}

// Export the live `_gulpInstance` binding (not a static re-export of the
// original "gulp" module's default) so useGulp() actually takes effect
// for every consumer that does `import { gulp } from "./globals.js"`.
export { _gulpInstance as gulp };
