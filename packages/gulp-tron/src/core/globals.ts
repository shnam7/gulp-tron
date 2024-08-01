import gulp from 'gulp'

// eslint-disable-next-line import/no-mutable-exports
let _gulpInstance = gulp

export function useGulp(gulpInstacen: typeof gulp) {
    _gulpInstance = gulpInstacen
}

export {_gulpInstance as gulp}
