declare module "lead" {
  import type { Readable } from "node:stream";

  /**
   * Sinks a stream to make it start flowing (reading) even if nothing is
   * consuming it yet, automatically backing off once something does
   * pipe from or listen to it. Used by vinyl-fs's own dest() to make it
   * work both mid-pipeline and as a terminal step; gulp-tron's dest()
   * uses it the same way for its own extra sourcemap-pairing stage.
   * Returns the same stream instance it was given.
   */
  export default function lead<T extends Readable>(stream: T): T;
}
