// Sample

const tron = require('gulp-tron');
const upath = require('upath');

const projectName = upath.basename(__dirname);
const prefix = projectName + ':';
const basePath = upath.relative(process.cwd(), __dirname);

//--- custom extension
tron.registerExtension('hello', (options={}, ...args) => (rtb) => {
    console.log(`Hello, this is custom extension. buildName=${rtb.name}`, options.msg)
    console.log(args);
});

tron.loadExtension(basePath + '/extension/*.js');

const customExt = {
    name: 'custom-ext',
    builder: rtb => rtb
        .hello({msg: 'Hi~~'}, 'arg1', 'arg2')
        .customExt1('a', 'b')
        .customExt2('c', 'd')
        .chain((rtb) => console.log(`custom function #1, buildName=${rtb.name}`))
        .chain(() => console.log('custom function #2')),

    postbuild: rtb => console.log(rtb.name + ` executed.`),
};


//--- custom builders
class CustomBuilder extends tron.builders.GBuilder {
    constructor() { super() }
    build() {
        console.log(`CustomBuilder is building '${this.name}'`);
    }
}

const customBuilder = {
    name: 'custom-builder',
    builder: new CustomBuilder(),
};


//--- custom builder xtending built-in CSS builder
class CustomCSSBuilder extends tron.builders.GCSSBuilder {
    src() {
        // print input files by overloading src() function
        return super.src().debug({ title: 'MyCSSBuilder:' })
    }
}

const customCSSBuilder = {
    name: 'custom-css-builder',
    builder: new CustomCSSBuilder(),
    src: upath.join(basePath, '*.scss'),
    dest: (file) => file.base,
    clean: [upath.join(basePath, "*.css")]
};


//--- custom function builder
const customFunctionBuilder = {
    name: 'custom-function-builder',
    builder: (rtb) => console.log(rtb.name + ' is executed.')
};


//--- imported custom builder: customBuildDirs
const customBuilderDirs = [upath.join(basePath, 'custom-builders')];
const importedCustomBuilder = {
    name: 'imported-custom-builder',
    builder: 'ImportedCustomBuilder'
};

const build = {
    name: '@build',
    triggers: tron.parallel(customExt, customBuilder, customCSSBuilder, customFunctionBuilder, importedCustomBuilder) }

tron.createProject(build, {prefix, customBuilderDirs}).addCleaner()
