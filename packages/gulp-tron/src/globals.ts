import gulp from 'gulp'

let _gulpInstance = gulp

export function useGulp(gulpInstance: typeof gulp) {
    _gulpInstance = gulpInstance
}

export {default as gulp} from 'gulp'
