declare module "gulp-data" {
  import type { GulpStream, LogOptions } from "gulp-tron";
  import type { TransformCallback, Vinyl } from "vinyl";

  export type DataObject<T extends Record<string, unknown> = Record<string, unknown>> = T &
    LogOptions;

  export type DataFunction = (file: Vinyl, callback: TransformCallback) => DataObject;

  export default function dataG(options: DataObject | DataFunction): GulpStream;
}
