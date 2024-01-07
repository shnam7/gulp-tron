'use strict';

const tron = require('gulp-tron');
const gulp = require('gulp');
const upath = require('upath');

const projectName = upath.basename(__dirname);
const prefix = projectName + ':';


//--- build item type #1: BuildConfig items
const build1 = { name: 'build1' };
const build2 = { name: 'build2' };

//--- build item type #2: native gulp task function
function gulpTaskFunc(done) { console.log('gulpTaskFunc: Hello, Lake!'); done(); }

//--- build item type #3: existing gulp task
gulp.task(prefix + 'nativeGulpTask', (done) => done()); // this task will be created first


//--- buildset: combination of single item, series, parallel
const set01 = [build1];
const set02 = [build1, build2, gulpTaskFunc, prefix+'nativeGulpTask']; // series
const set03 = tron.parallel(build1, build2);
const set04 = tron.series(build1, build2);
const set05 = [build1, build2];   // serial set, the same as set04
const set06 = prefix + 'build1';

const simpleTask = {
    name: 'simple-build',
    builder: (rtb) => console.log(rtb.name + ' executed'),
    preBuild: rtb => console.log(rtb.name + `:preBuild called, customVar1=${rtb.conf.customVar1}`),
    postBuild: (rtb) => console.log(rtb.name +`:postBuild called,` + `customVar1=${rtb.conf.customVar2}`),

    // buildSet can be of type GulpTaskFunction, not normal function.
    // so, gulp.serial() or gulp.parallel() is required
    triggers: tron.parallel((done) => {
        console.log(this.name, `: trigger successful.`);
        done();
    }),

    customVar1: 'customer variable#1',
    customVar2: 'customer variable#2'
}


//--- external commands
const cmd1 = {
    name: 'cmd1',
    builder: rtb => rtb.exec({ command: 'dir', args: ['.'] }),
    flushStream: true
}

const cmd2 = {
    name: 'cmd2',
    builder: {
        command: 'node',
        args: ['-v'],
        options: { shell: false }
    },
    flushStream: true
}

const main = {
    name: '@build',
    builder: (rtb) => console.log(rtb.name + ' is running'),
    dependencies: tron.parallel(set01, set02, set03, set04, set05, set06),
    triggers: [cmd1, cmd2]  // run in series
}

tron.createProject({build1, build2, simpleTask, cmd1, cmd2, main}, {prefix})
