import gulpSass from "gulp-sass";
import * as dartSass from "sass";

const sass = gulpSass(dartSass);

const myScss = (options) => (bs) => {
  console.log("myScss called with options:", options);
  bs.pipe(sass(options || {}));
};

export default myScss;
