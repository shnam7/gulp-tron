import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
// import { terserP } from "@gulp-tron/plugin-scripts";
import { cleanCssP, sassP } from "@gulp-tron/plugin-styles";
import htmlCleanG from "gulp-htmlmin";
import prettierG from "gulp-prettier";
import swc from "gulp-swc";
import tron, { delay, parallel } from "gulp-tron";
import paniniG from "panini";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- project settings
const basePath = path.relative(process.cwd(), __dirname);
const projectName = path.basename(__dirname);
const prefix = projectName;
const srcRoot = path.join(basePath, "src");
const destRoot = path.join(basePath, "dist");
const portBase = 5000;

const paniniOptions = {
  root: path.join(srcRoot, "panini/pages/"),
  layouts: path.join(srcRoot, "panini/layouts/"),
  partials: path.join(srcRoot, "panini/partials/"),
  data: path.join(srcRoot, "panini/data/"),
  helpers: path.join(srcRoot, "panini/helpers/"),
  pagelayouts: {
    // All pages inside src/pages/blog will use the blog.html layout
    // 'blog': 'blog'
  },
};

const statics = {
  name: "static",
  build(bs) {
    bs.src().changed().dest();
  },
  src: [path.join(srcRoot, "static/**/*")],
  dest: destRoot,
};

const panini = {
  name: "panini",
  build(bs) {
    paniniG.refresh();
    bs.src()
      .pipe(paniniG(paniniOptions))
      .rename({ extname: ".html" })
      .pipe(prettierG({ tabWidth: 4 }))
      .pipe(htmlCleanG({ collapseWhitespace: false }))
      .dest();
  },

  // panini does not handle backslashes correctly, so replace them to slashPreloa
  src: [path.join(srcRoot, "panini/pages/**/*")],
  dest: path.join(destRoot, ""),
  // include sub directories to detect changes of the file which are not in src list.
  watch: [path.join(srcRoot, "panini/**/*")],
  // watch: [path.join(srcRoot, 'panini/**/*'), '!'+path.join(srcRoot, '{static,scripts,scss}/**/*')]
};

const scss = {
  name: "scss",
  build: (bs) => bs.src().chain(sassP()).chain(cleanCssP()).rename({ extname: ".min.css" }).dest(),

  src: path.join(srcRoot, "scss/**/*.scss"),
  dest: path.join(destRoot, "css"),
};

// const tsProject = gulpEsbuild.createProject("tsconfig.json", { declaration: true });
const scripts = {
  name: "scripts",

  build(bs) {
    bs
      // .src({ read: false })
      .debug("src:")
      .exec("tsc --project tsconfig.json")
      .exec("tsc --project tsconfig.json --declaration --emitDeclarationOnly");
    // bs.src().promise(async () => {
    //   console.log("Waiting script build...");
    //   await delay(1000);
    //   console.log("Starting script build...");
    // });

    //   .promise(async () => {
    //     console.log("Second promise...");
    //   });
    //   .debug("src:")
    //   .pipe(swc({ jsc: { target: "es2020", parser: { syntax: "typescript" } } }))
    //   .debug("swc:")
    //   .chain(terserP())
    //   .rename({ extname: ".min.js" })
    //   .debug("min:")
    //   .changed()
    //   .debug("changed:")
    //   .dest();
  },

  src: path.join(srcRoot, "scripts/**/*.ts"),
  dest: path.join(destRoot, "js"),
};

const build = {
  name: "@build",
  triggers: parallel(statics, panini, scss, scripts),
  clean: [destRoot],
};

tron
  .task(build)
  .addCleaner()
  .addWatcher({
    browserSync: {
      server: path.resolve(destRoot),
      port: portBase + Number.parseInt(prefix, 10),
      ui: { port: portBase + 100 + Number.parseInt(prefix, 10) },
    },
  });
