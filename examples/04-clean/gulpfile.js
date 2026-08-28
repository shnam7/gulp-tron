import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import tron from "gulp-tron";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Const projectName = path.basename(__dirname)
// const prefix = projectName + ':'
const basePath = path.relative(process.cwd(), __dirname);
const srcRoot = path.join(basePath, "assets");
const destRoot = path.join(basePath, "dist");
const fixturePath = path.join(destRoot, "do-not-delete");

const fixture = {
  name: "fixture",
  build: async (bs) => {
    await bs.exec(`mkdir -p ${fixturePath}`).exec(`touch ${path.join(fixturePath, "sample.txt")}`);
  },
  clean: [fixturePath],
};

const copier = {
  name: "copier",
  async build(bs) {
    await bs
      .copy({ src: [path.join(destRoot, "do-not-delete/sample.txt")], dest: destRoot })
      .finish();

    try {
      fs.accessSync(bs.opts.clean[0]);
    } catch (error) {
      bs.log("==> Error:file copy failed");
      throw error;
    }
  },
  clean: [path.join(destRoot, "sample.txt")],
  logLevel: "verbose",
};

const deleter = {
  name: "deleter",
  build: (bs) => bs.clean("dir/**/files-to-delete*.*"), // Extra clean targets in addition to build config clean target

  // clean target for this build config
  clean: [
    path.join(srcRoot, "build2/**/dummy.txt"),
    path.join(destRoot, "**/*"),

    // Exclude from clean
    `!${fixturePath}`, // parent directory should not be deleted.
    // `!${path.join(fixturePath, "**/*.*")}`,
  ],
};

const checker = {
  name: "checker",
  build(bs) {
    // fixture file should've not been deleted:
    try {
      fs.statSync(path.join(fixturePath, "sample.txt"));
      bs.log("Do-not-delete is working!");
    } catch (error) {
      bs.logger.error("Checker failed: 'Do-not-delete' is not working!\n");
      throw error;
    }

    // copied file should've been deleted:
    try {
      fs.statSync(path.join(destRoot, "sample.txt"));
      throw Error("Checker failed: Selective deletion is not working!\n");
    } catch (_error) {
      bs.log("Selective deletion is working!");
    }
    bs.log("Checker successful!");
  },
};

const build = {
  name: "@build",
  triggers: [fixture, copier, deleter, checker],
  clean: destRoot,
};

tron.task(build).addCleaner();
