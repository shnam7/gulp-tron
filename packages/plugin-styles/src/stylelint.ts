/**
 *  gulp-tron plugin-styles:stylelint
 *
 */

import is from "@wicle/is";
import pcssG from "gulp-postcss";
import type { BuildStream, PluginFunction } from "gulp-tron";
import type postcss from "postcss";
import lessParser from "postcss-less";
import pcssReporter from "postcss-reporter";
import sassParser from "postcss-sass";
import scssParser from "postcss-scss";
import stylelint, { type PostcssPluginOptions } from "stylelint";

// any 대신 unknown을 사용하여 ESLint 경고 우회 및 안전성 확보
export type StylelintOptions = PostcssPluginOptions & Record<string, unknown>;
export type StylelintReporterOptions = pcssReporter.Options;
export type PostcssPluginType = postcss.AcceptedPlugin;

/**
 * Stylelint Plugin - use postcss for linting.
 *
 * @param options - Stylelint options
 * @param reporterOptions - Postcss reporter options
 * @returns PluginFunction
 */
export const stylelintP =
  (
    options: StylelintOptions = { rules: {} }, // 매개변수 기본값을 지정하여 안전성 확보
    reporterOptions: StylelintReporterOptions = {},
  ): PluginFunction =>
  (bs: BuildStream) => {
    // 임시 파서 타입을 정확한 gulp-postcss 옵션 타입으로 단언
    let pcssOptions: pcssG.Options = { parser: options.parser as pcssG.Options["parser"] };

    if (!is.isObject(options.parser)) {
      switch (options.parser) {
        case "scss":
          pcssOptions = { parser: scssParser as pcssG.Options["parser"] };
          break;

        case "sass":
          pcssOptions = { parser: sassParser as pcssG.Options["parser"] };
          break;

        case "less":
          pcssOptions = { parser: lessParser as pcssG.Options["parser"] };
          break;

        default:
          if (options.parser !== undefined) {
            console.warn(
              `stylelintP: unrecognized parser "${String(options.parser)}", using default parser`,
            );
          }
          break;
      }
    }

    bs.pipe(
      pcssG(
        [
          stylelint(options) as unknown as PostcssPluginType,
          pcssReporter(reporterOptions) as unknown as PostcssPluginType,
        ],
        pcssOptions,
      ),
    ).on("error", (e: Error) => {
      bs.log(e.toString());
    });
  };

/**
 * Stylelint Sass Plugin - stylelint with postcss-sass as default parser.
 */
export const stylelintSassP = (
  options: StylelintOptions = {},
  reporterOptions: StylelintReporterOptions = {},
) => {
  const opts: StylelintOptions = { ...options, parser: sassParser as unknown };
  return stylelintP(opts, reporterOptions);
};

/**
 * Stylelint Scss Plugin - stylelint with postcss-scss as default parser.
 */
export const stylelintScssP = (
  options: StylelintOptions = {},
  reporterOptions: StylelintReporterOptions = {},
) => {
  const opts: StylelintOptions = { ...options, parser: scssParser as unknown };
  return stylelintP(opts, reporterOptions);
};

/**
 * Stylelint Less Plugin - stylelint with postcss-less as default parser.
 */
export const stylelintLessP = (
  options: StylelintOptions = {},
  reporterOptions: StylelintReporterOptions = {},
) => {
  const opts: StylelintOptions = { ...options, parser: lessParser as unknown };
  return stylelintP(opts, reporterOptions);
};

export default stylelintP;
