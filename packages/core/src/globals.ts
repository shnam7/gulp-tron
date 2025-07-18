import gulp from 'gulp'

let _gulpInstance = gulp

export function useGulp(gulpInstacen: typeof gulp) {
    _gulpInstance = gulpInstacen
}

export {default as gulp} from 'gulp'
