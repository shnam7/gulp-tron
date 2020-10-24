(window.webpackJsonp=window.webpackJsonp||[]).push([[48],{106:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return s})),n.d(t,"metadata",(function(){return l})),n.d(t,"rightToc",(function(){return c})),n.d(t,"default",(function(){return p}));var i=n(2),a=n(6),r=(n(0),n(118)),s={id:"rtb",title:"RTB"},l={unversionedId:"api/rtb",id:"api/rtb",isDocsHomePage:!1,title:"RTB",description:"Quick Example",source:"@site/docs\\api\\05-rtb.md",slug:"/api/rtb",permalink:"/gulp-tron/api/rtb",editUrl:"https://github.com/facebook/docusaurus/edit/master/website/docs/api/05-rtb.md",version:"current",sidebar:"docs",previous:{title:"Project",permalink:"/gulp-tron/api/project"},next:{title:"GBuilder",permalink:"/gulp-tron/builtin-builders/GBuilder"}},c=[{value:"RTB API",id:"rtb-api",children:[{value:"setBuildOptions()",id:"setbuildoptions",children:[]},{value:"setModuleOptions()",id:"setmoduleoptions",children:[]},{value:"src()",id:"src",children:[]},{value:"dest()",id:"dest",children:[]},{value:"pipe()",id:"pipe",children:[]},{value:"chain()",id:"chain",children:[]},{value:"promise()",id:"promise",children:[]},{value:"sync()",id:"sync",children:[]},{value:"async()",id:"async",children:[]},{value:"wait()",id:"wait",children:[]},{value:"pushStream()",id:"pushstream",children:[]},{value:"popStream()",id:"popstream",children:[]},{value:"debug()",id:"debug",children:[]},{value:"filter()",id:"filter",children:[]},{value:"rename()",id:"rename",children:[]},{value:"copy()",id:"copy",children:[]},{value:"del()",id:"del",children:[]},{value:"exec()",id:"exec",children:[]},{value:"clean()",id:"clean",children:[]},{value:"concat()",id:"concat",children:[]},{value:"minifyCss()",id:"minifycss",children:[]},{value:"minifyJs()",id:"minifyjs",children:[]}]},{value:"Properties",id:"properties",children:[{value:"conf",id:"conf",children:[]},{value:"name",id:"name",children:[]},{value:"buildOptions",id:"buildoptions",children:[]},{value:"moduleOptions",id:"moduleoptions",children:[]},{value:"stream",id:"stream",children:[]}]}],o={rightToc:c};function p(e){var t=e.components,n=Object(a.a)(e,["components"]);return Object(r.b)("wrapper",Object(i.a)({},o,n,{components:t,mdxType:"MDXLayout"}),Object(r.b)("h4",{id:"quick-example"},"Quick Example"),Object(r.b)("p",null,"Th example will copy *.txt files, showing the file names using 'gulp-debug'."),Object(r.b)("pre",null,Object(r.b)("code",Object(i.a)({parentName:"pre"},{className:"language-js"}),"const tron = require('gulp-tron');\n\nconst copy = {\n    name: 'my-copy',\n    builder: rtb => rtb.src().debug({title: rtb.name + '::'}).dest(),\n    src: ['src/**/*.txt'],\n    dest: '_build'\n}\n\ntron.createProject({copy}).addWatcher();\n")),Object(r.b)("h2",{id:"rtb-api"},"RTB API"),Object(r.b)("h3",{id:"setbuildoptions"},"setBuildOptions()"),Object(r.b)("pre",null,Object(r.b)("code",Object(i.a)({parentName:"pre"},{className:"language-js"}),"setBuildOptions(opts: Options): void;\n")),Object(r.b)("p",null,"Merge opts to rtb.buildOptions. This is shallow copy using Object.assign()."),Object(r.b)("h3",{id:"setmoduleoptions"},"setModuleOptions()"),Object(r.b)("pre",null,Object(r.b)("code",Object(i.a)({parentName:"pre"},{className:"language-js"}),"setModuleOptions(opts: Options): void;\n")),Object(r.b)("p",null,"Merge opts to rtb.moduleOptions. This is shallow copy using Object.assign()."),Object(r.b)("h3",{id:"src"},"src()"),Object(r.b)("pre",null,Object(r.b)("code",Object(i.a)({parentName:"pre"},{className:"language-js"}),"src(src?: string | string[]) => this;\n")),Object(r.b)("p",null,"Creates internal gulp stream with files specified in BuildConf.src. sourceMap is automatically handled if it is enabled in BuildConfig."),Object(r.b)("h3",{id:"dest"},"dest()"),Object(r.b)("pre",null,Object(r.b)("code",Object(i.a)({parentName:"pre"},{className:"language-js"}),"dest(path?: string) => this;\n")),Object(r.b)("p",null,"Calls gulp.dest() on internal gulp stream with BuildConf.dest. sourceMap is automatically handled if is enabled in BuildConfig."),Object(r.b)("h3",{id:"pipe"},"pipe()"),Object(r.b)("pre",null,Object(r.b)("code",Object(i.a)({parentName:"pre"},{className:"language-js"}),"pipe(destination: any, options?: { end?: boolean; }) => this;\n")),Object(r.b)("p",null,"Calls gulp pipe() on internal gulp stream."),Object(r.b)("h3",{id:"chain"},"chain()"),Object(r.b)("pre",null,Object(r.b)("code",Object(i.a)({parentName:"pre"},{className:"language-js"}),"chain(action: BuildFunction) => this;\n")),Object(r.b)("p",null,"Calls plugin action with this RTB innstance. If promise is returned from the plugin, then it is handled in sync or async depending on current sync mode."),Object(r.b)("h3",{id:"promise"},"promise()"),Object(r.b)("pre",null,Object(r.b)("code",Object(i.a)({parentName:"pre"},{className:"language-js"}),"type PromiseExecutor = () => void | Promise<unknown>;\n\npromise(promise?: Promise<unknown> | void | PromiseExecutor, sync: boolean = false) => this;\n")),Object(r.b)("p",null,"If 'promise' argument is an instance of Promise, then it is added to sync or async promise queue depending on current sync mode (default is async)."),Object(r.b)("p",null,"If promise is a function, then it is added to sync promise queue in sync mode, or it is executed immediately in async mode. if it returns promise, then it is added to sync or async queue depending on current sync mode."),Object(r.b)("p",null,"The last argument, 'sync' will override current sync mode."),Object(r.b)("p",null,"Current sync mode is determined by conf.sync property initially, but it can be changed by RTB functions, sync() or async()."),Object(r.b)("p",null,"Note that all the promise objects, sync or async, are waited before finishing the build process. If no sync mode specified, all the build operations are executed in async mode by default for better performance."),Object(r.b)("h3",{id:"sync"},"sync()"),Object(r.b)("pre",null,Object(r.b)("code",Object(i.a)({parentName:"pre"},{className:"language-js"}),"sync() => this;\n")),Object(r.b)("p",null,"Turns on sync mode. Once enabled, all the build operations are executed in sequence."),Object(r.b)("h3",{id:"async"},"async()"),Object(r.b)("pre",null,Object(r.b)("code",Object(i.a)({parentName:"pre"},{className:"language-js"}),"async() => this;\n")),Object(r.b)("p",null,"Turns off sync mode. In async mode, all the build operations are executed in parallel."),Object(r.b)("h3",{id:"wait"},"wait()"),Object(r.b)("pre",null,Object(r.b)("code",Object(i.a)({parentName:"pre"},{className:"language-js"}),"wait(msec: number = 0, sync: boolean = false) => this;\n")),Object(r.b)("p",null,"Add a promise waiting for msec. In sync mode, this will suspend build operations in sync promise queue for msec. In async mode, this wait will be independent of other build operations, and it will only delays the finishig of whole build process up to msec."),Object(r.b)("p",null,"The last argument, 'sync' will override current sync state for this operation."),Object(r.b)("h3",{id:"pushstream"},"pushStream()"),Object(r.b)("pre",null,Object(r.b)("code",Object(i.a)({parentName:"pre"},{className:"language-js"}),"pushStream() => this;\n")),Object(r.b)("p",null,"Save current gulp stream into internal stream queue. Multiple pushes are allowed."),Object(r.b)("h3",{id:"popstream"},"popStream()"),Object(r.b)("pre",null,Object(r.b)("code",Object(i.a)({parentName:"pre"},{className:"language-js"}),"popStream() => this;\n")),Object(r.b)("p",null,"If internal promise queue is not empty, then current stream is added to promise execution sequence to be flushed, and the latest stream pushed to the internal stream queue is restored as current stream. Multiple pops are allowed."),Object(r.b)("h3",{id:"debug"},"debug()"),Object(r.b)("pre",null,Object(r.b)("code",Object(i.a)({parentName:"pre"},{className:"language-js"}),"debug(options: Options = {}) => this;\n")),Object(r.b)("p",null,"Loads 'gulp-debug' module and pipe it to internal gulp stream with opts as argument."),Object(r.b)("h3",{id:"filter"},"filter()"),Object(r.b)("pre",null,Object(r.b)("code",Object(i.a)({parentName:"pre"},{className:"language-js"}),'filter(pattern: string | string[] | filter.FileFunction = ["**", "!**/*.map"],\n    options: filter.Options = {}) => this;\n')),Object(r.b)("p",null,"Loads 'gulp-filter' module and pipe it to internal gulp stream with pattern and options as argument."),Object(r.b)("h3",{id:"rename"},"rename()"),Object(r.b)("pre",null,Object(r.b)("code",Object(i.a)({parentName:"pre"},{className:"language-js"}),"rename(options: Options = {}) => this;\n")),Object(r.b)("p",null,"Loads 'gulp-rename' module and pipe it to internal gulp stream with options as argument.\nRefer to ",Object(r.b)("a",Object(i.a)({parentName:"p"},{href:"https://github.com/hparra/gulp-rename"}),"gulp-rename")," documents for option details."),Object(r.b)("h3",{id:"copy"},"copy()"),Object(r.b)("pre",null,Object(r.b)("code",Object(i.a)({parentName:"pre"},{className:"language-js"}),"copy(param?: CopyParam | CopyParam[], options: Options = {}) => this;\n")),Object(r.b)("p",null,"In sync mode, all the copy operations specified in 'param' are added to sync promise queue, and will be executed in sequence.\nIn async mode, all the copy operations executed immediately, and the returned promise is added to sync or async queue depending on current sync state."),Object(r.b)("p",null,"The last argument, 'sync' will override current sync state for this operation."),Object(r.b)("h3",{id:"del"},"del()"),Object(r.b)("pre",null,Object(r.b)("code",Object(i.a)({parentName:"pre"},{className:"language-js"}),"del(patterns: string | string[], options: Options = {}) => this;\n")),Object(r.b)("p",null,"In sync mode, delete operation is added to sync promise queue, and will be executed in sequence.\nIn async mode, delete operation executed immediately, and the returned promise is added to sync or async queue depending on current sync state."),Object(r.b)("p",null,"For this operation, 'del' module is loaded and called with pattern and options as arguments."),Object(r.b)("h4",{id:"options"},"options"),Object(r.b)("p",null,"options argument accepts all the properties available from node 'del' module."),Object(r.b)("p",null,"In addition, options.sync can be specified to override current sync state for this operation."),Object(r.b)("h3",{id:"exec"},"exec()"),Object(r.b)("pre",null,Object(r.b)("code",Object(i.a)({parentName:"pre"},{className:"language-js"}),"exec(cmd: string | ExternalCommand, args: string[] = [], options: SpawnOptions = {}) => this;\n")),Object(r.b)("p",null,"Executes external commands with cmd, args, and options. In sync mode, the command execution is added to sync promise queue, and will be executed in sequence. In async mode, the command is executed immediately, and the returned promise is added to sync or async queue depending on current sync state."),Object(r.b)("p",null,"The last argument, 'sync' will override current sync state for this operation."),Object(r.b)("h3",{id:"clean"},"clean()"),Object(r.b)("pre",null,Object(r.b)("code",Object(i.a)({parentName:"pre"},{className:"language-js"}),"clean(options: CleanOptions = {}): this\n")),Object(r.b)("p",null,"Triggers delete operations for the patterns specified in BuildConfig.clean and options.clean.\nFor this operation, 'del' module is loaded and called with options as arguments."),Object(r.b)("p",null,"In sync mode, the clean operation is added to sync promise queue, and will be executed in sequence. In async mode, it is executed immediately, and the returned promise is added to sync or async queue depending on current sync state."),Object(r.b)("h4",{id:"options-1"},"options"),Object(r.b)("p",null,"clean() internally use del(). So, options argument accepts all the properties available for del() including options.sync."),Object(r.b)("h3",{id:"concat"},"concat()"),Object(r.b)("pre",null,Object(r.b)("code",Object(i.a)({parentName:"pre"},{className:"language-js"}),"concat(options: Options = {}) => this;\n")),Object(r.b)("p",null,"Loads 'gulp-concat' module and pipe it to internal gulp stream with BuildConfig.outFile and options.concat as arguments.\nif BuildConfig.outFile is not specified, the operation will be skipped with a warning message. In this operation, *.map files in current gulp stream will be filtered out. If BuildConfig.sourceMaps is set to true, map files will be generated."),Object(r.b)("h3",{id:"minifycss"},"minifyCss()"),Object(r.b)("pre",null,Object(r.b)("code",Object(i.a)({parentName:"pre"},{className:"language-js"}),"minifyCss(options: Options = {}) => this;\n")),Object(r.b)("p",null,"Minify css files in the current stream. This operation will filter out ",Object(r.b)("em",{parentName:"p"},".map files. Output files will have '"),".min.css'  extension names. If BuildConfig.sourceMaps is set to true, map files will be grnerated."),Object(r.b)("h3",{id:"minifyjs"},"minifyJs()"),Object(r.b)("pre",null,Object(r.b)("code",Object(i.a)({parentName:"pre"},{className:"language-js"}),"minifyJs(options: Options = {}) => this;\n")),Object(r.b)("p",null,"Minify javascript files in the current stream. This operation will filter out ",Object(r.b)("em",{parentName:"p"},".map files. Output files will have '"),".min.js' extion names. If BuildConfig.sourceMaps is set to true, map files will be grnerated."),Object(r.b)("hr",null),Object(r.b)("h2",{id:"properties"},"Properties"),Object(r.b)("h3",{id:"conf"},"conf"),Object(r.b)("p",null,"BuildConfig object this RTB is attached to."),Object(r.b)("h3",{id:"name"},"name"),Object(r.b)("p",null,"Name of the build configuration, and the name of gulp task created for the build process."),Object(r.b)("h3",{id:"buildoptions"},"buildOptions"),Object(r.b)("p",null,"Shortcut to conf.buildOptions"),Object(r.b)("h3",{id:"moduleoptions"},"moduleOptions"),Object(r.b)("p",null,"Shortcut to conf.moduleOptions"),Object(r.b)("h3",{id:"stream"},"stream"),Object(r.b)("p",null,"Internal file stream, typically opened by gulp.src() when conf.src is valid."))}p.isMDXComponent=!0},118:function(e,t,n){"use strict";n.d(t,"a",(function(){return d})),n.d(t,"b",(function(){return m}));var i=n(0),a=n.n(i);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function s(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?s(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):s(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function c(e,t){if(null==e)return{};var n,i,a=function(e,t){if(null==e)return{};var n,i,a={},r=Object.keys(e);for(i=0;i<r.length;i++)n=r[i],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(i=0;i<r.length;i++)n=r[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var o=a.a.createContext({}),p=function(e){var t=a.a.useContext(o),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},d=function(e){var t=p(e.components);return a.a.createElement(o.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return a.a.createElement(a.a.Fragment,{},t)}},b=a.a.forwardRef((function(e,t){var n=e.components,i=e.mdxType,r=e.originalType,s=e.parentName,o=c(e,["components","mdxType","originalType","parentName"]),d=p(n),b=i,m=d["".concat(s,".").concat(b)]||d[b]||u[b]||r;return n?a.a.createElement(m,l(l({ref:t},o),{},{components:n})):a.a.createElement(m,l({ref:t},o))}));function m(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var r=n.length,s=new Array(r);s[0]=b;var l={};for(var c in t)hasOwnProperty.call(t,c)&&(l[c]=t[c]);l.originalType=e,l.mdxType="string"==typeof e?e:i,s[1]=l;for(var o=2;o<r;o++)s[o]=n[o];return a.a.createElement.apply(null,s)}return a.a.createElement.apply(null,n)}b.displayName="MDXCreateElement"}}]);