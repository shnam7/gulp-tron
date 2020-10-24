(window.webpackJsonp=window.webpackJsonp||[]).push([[4],{54:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return i})),n.d(t,"metadata",(function(){return b})),n.d(t,"rightToc",(function(){return c})),n.d(t,"default",(function(){return s}));var a=n(2),r=n(6),l=(n(0),n(99)),i={id:"gulp-tron",title:"gulp-tron"},b={unversionedId:"api/gulp-tron",id:"api/gulp-tron",isDocsHomePage:!1,title:"gulp-tron",description:"gulp-tron API is available immediately once it is loaded.",source:"@site/docs\\api\\01-gulp-tron.md",slug:"/api/gulp-tron",permalink:"/gulp-tron/api/gulp-tron",editUrl:"https://github.com/facebook/docusaurus/edit/master/website/docs/api/01-gulp-tron.md",version:"current",sidebar:"docs",previous:{title:"RTB Extension",permalink:"/gulp-tron/guide/extension"},next:{title:"Project",permalink:"/gulp-tron/api/project"}},c=[{value:"API",id:"api",children:[{value:"createProject()",id:"createproject",children:[]},{value:"getBuildNames()",id:"getbuildnames",children:[]},{value:"findProject()",id:"findproject",children:[]},{value:"setPackageManager()",id:"setpackagemanager",children:[]},{value:"series()",id:"series",children:[]},{value:"parallel()",id:"parallel",children:[]},{value:"registerExtension()",id:"registerextension",children:[]},{value:"loadExtension()",id:"loadextension",children:[]},{value:"require()",id:"require",children:[]}]},{value:"Properties",id:"properties",children:[{value:"conf",id:"conf",children:[]},{value:"rtbs",id:"rtbs",children:[]},{value:"builders",id:"builders",children:[]},{value:"utils",id:"utils",children:[]}]}],o={rightToc:c};function s(e){var t=e.components,n=Object(r.a)(e,["components"]);return Object(l.b)("wrapper",Object(a.a)({},o,n,{components:t,mdxType:"MDXLayout"}),Object(l.b)("p",null,"gulp-tron API is available immediately once it is loaded."),Object(l.b)("pre",null,Object(l.b)("code",Object(a.a)({parentName:"pre"},{className:"language-js"}),"const tron = require('gulp-tron');\n")),Object(l.b)("h2",{id:"api"},"API"),Object(l.b)("h3",{id:"createproject"},"createProject()"),Object(l.b)("pre",null,Object(l.b)("code",Object(a.a)({parentName:"pre"},{className:"language-js"}),"createProject(buildItems: BuildItem | BuildItems = {}, opts?: ProjectOptions) => GProject;\n")),Object(l.b)("p",null,"Create project instance and returns it. The projet is added to the project iist of gulp-tron."),Object(l.b)("h4",{id:"parameters"},"Parameters"),Object(l.b)("table",null,Object(l.b)("thead",{parentName:"table"},Object(l.b)("tr",{parentName:"thead"},Object(l.b)("th",Object(a.a)({parentName:"tr"},{align:null}),"parameter"),Object(l.b)("th",Object(a.a)({parentName:"tr"},{align:null}),"type"),Object(l.b)("th",Object(a.a)({parentName:"tr"},{align:null}),"description"))),Object(l.b)("tbody",{parentName:"table"},Object(l.b)("tr",{parentName:"tbody"},Object(l.b)("td",Object(a.a)({parentName:"tr"},{align:null}),"buildItems"),Object(l.b)("td",Object(a.a)({parentName:"tr"},{align:null}),"BuildItem or BuildItems"),Object(l.b)("td",Object(a.a)({parentName:"tr"},{align:null}),"Single build item or Object of multiple build items. See below ",Object(l.b)("strong",{parentName:"td"},"Builditem"))),Object(l.b)("tr",{parentName:"tbody"},Object(l.b)("td",Object(a.a)({parentName:"tr"},{align:null}),"options"),Object(l.b)("td",Object(a.a)({parentName:"tr"},{align:null}),"ProjectOptions"),Object(l.b)("td",Object(a.a)({parentName:"tr"},{align:null}),"See belo ",Object(l.b)("strong",{parentName:"td"},"ProjectOptions"))))),Object(l.b)("h4",{id:"builditem"},"BuildItem"),Object(l.b)("p",null,"BuildItem is one of following 3 configuration types. Refer to ",Object(l.b)("a",Object(a.a)({parentName:"p"},{href:"../guide/builders"}),"Builders")," section for more details."),Object(l.b)("ul",null,Object(l.b)("li",{parentName:"ul"},"BuildConfig"),Object(l.b)("li",{parentName:"ul"},"WatcherConfig"),Object(l.b)("li",{parentName:"ul"},"CleanerConfig")),Object(l.b)("p",null,"BuildItems is an object with multiple BuildItem configurations."),Object(l.b)("pre",null,Object(l.b)("code",Object(a.a)({parentName:"pre"},{className:"language-js"}),"const buildItem1 = { name: 'scss', builder: 'GCSSBuilder', /*...*/}\nconst buildItem2 = { name: 'scripts', builder: 'GTypeScriptBuilder', /*...*/}\nconst cleaner = { builder: 'cleaner' }\nconst watcher = { builder: 'watcher' }\nconst buildItems = { buildItem1, buildItem2, cleaner, watcher }\n")),Object(l.b)("h4",{id:"projectoptions"},"ProjectOptions"),Object(l.b)("table",null,Object(l.b)("thead",{parentName:"table"},Object(l.b)("tr",{parentName:"thead"},Object(l.b)("th",Object(a.a)({parentName:"tr"},{align:null}),"parameter"),Object(l.b)("th",Object(a.a)({parentName:"tr"},{align:null}),"type"),Object(l.b)("th",Object(a.a)({parentName:"tr"},{align:null}),"default"),Object(l.b)("th",Object(a.a)({parentName:"tr"},{align:null}),"description"))),Object(l.b)("tbody",{parentName:"table"},Object(l.b)("tr",{parentName:"tbody"},Object(l.b)("td",Object(a.a)({parentName:"tr"},{align:null}),"projectName"),Object(l.b)("td",Object(a.a)({parentName:"tr"},{align:null}),"string"),Object(l.b)("td",Object(a.a)({parentName:"tr"},{align:null}),"undefined"),Object(l.b)("td",Object(a.a)({parentName:"tr"},{align:null}),"Optional project name")),Object(l.b)("tr",{parentName:"tbody"},Object(l.b)("td",Object(a.a)({parentName:"tr"},{align:null}),"prefix"),Object(l.b)("td",Object(a.a)({parentName:"tr"},{align:null}),"string"),Object(l.b)("td",Object(a.a)({parentName:"tr"},{align:null}),'""'),Object(l.b)("td",Object(a.a)({parentName:"tr"},{align:null}),"Optional project prefix. This is prefixed to names of all the build items in the project when they are resolved.")),Object(l.b)("tr",{parentName:"tbody"},Object(l.b)("td",Object(a.a)({parentName:"tr"},{align:null}),"customBuilderDirs"),Object(l.b)("td",Object(a.a)({parentName:"tr"},{align:null}),"strinf or strinf[]"),Object(l.b)("td",Object(a.a)({parentName:"tr"},{align:null}),"undefined"),Object(l.b)("td",Object(a.a)({parentName:"tr"},{align:null}),"Directory list to search for builder class names")))),Object(l.b)("h3",{id:"getbuildnames"},"getBuildNames()"),Object(l.b)("pre",null,Object(l.b)("code",Object(a.a)({parentName:"pre"},{className:"language-js"}),"getBuildNames(selector: string | string[] | RegExp | RegExp[]): string[]\n")),Object(l.b)("p",null,"Returns an array of build names from all the projects that matches the pattern in selector."),Object(l.b)("h3",{id:"findproject"},"findProject()"),Object(l.b)("pre",null,Object(l.b)("code",Object(a.a)({parentName:"pre"},{className:"language-js"}),"findProject(projectName: string) => GProject | undefined;\n")),Object(l.b)("p",null,"Returns first project that matches parojectName. projectName can be optionally assigned when it's created by createProject() function. If not found, returns undefined."),Object(l.b)("h3",{id:"setpackagemanager"},"setPackageManager()"),Object(l.b)("pre",null,Object(l.b)("code",Object(a.a)({parentName:"pre"},{className:"language-js"}),"setPackageManager(packageManager: string | PackageManagerOptions) => void;\n")),Object(l.b)("p",null,"Sets package manager options. packageManager can be string value of 'npm', 'pnpm' or 'yarn'. In this case, package install option is set to default which is installing the module as devDependencies. If packageManager is object type, then it can have following propeties."),Object(l.b)("table",null,Object(l.b)("thead",{parentName:"table"},Object(l.b)("tr",{parentName:"thead"},Object(l.b)("th",Object(a.a)({parentName:"tr"},{align:null}),"Property"),Object(l.b)("th",Object(a.a)({parentName:"tr"},{align:null}),"type"),Object(l.b)("th",Object(a.a)({parentName:"tr"},{align:null}),"default"),Object(l.b)("th",Object(a.a)({parentName:"tr"},{align:null}),"description"))),Object(l.b)("tbody",{parentName:"table"},Object(l.b)("tr",{parentName:"tbody"},Object(l.b)("td",Object(a.a)({parentName:"tr"},{align:null}),"name"),Object(l.b)("td",Object(a.a)({parentName:"tr"},{align:null}),"string"),Object(l.b)("td",Object(a.a)({parentName:"tr"},{align:null}),"undefined"),Object(l.b)("td",Object(a.a)({parentName:"tr"},{align:null}),"Name of the package maager")),Object(l.b)("tr",{parentName:"tbody"},Object(l.b)("td",Object(a.a)({parentName:"tr"},{align:null}),"installComand"),Object(l.b)("td",Object(a.a)({parentName:"tr"},{align:null}),"string"),Object(l.b)("td",Object(a.a)({parentName:"tr"},{align:null}),"undefined"),Object(l.b)("td",Object(a.a)({parentName:"tr"},{align:null}),"Package installation command (ex: npm i)")),Object(l.b)("tr",{parentName:"tbody"},Object(l.b)("td",Object(a.a)({parentName:"tr"},{align:null}),"installOptions"),Object(l.b)("td",Object(a.a)({parentName:"tr"},{align:null}),"string"),Object(l.b)("td",Object(a.a)({parentName:"tr"},{align:null}),"undefined"),Object(l.b)("td",Object(a.a)({parentName:"tr"},{align:null}),"package installation options (ex: --save-dev)")),Object(l.b)("tr",{parentName:"tbody"},Object(l.b)("td",Object(a.a)({parentName:"tr"},{align:null}),"autoInstall"),Object(l.b)("td",Object(a.a)({parentName:"tr"},{align:null}),"boolean"),Object(l.b)("td",Object(a.a)({parentName:"tr"},{align:null}),"undefined"),Object(l.b)("td",Object(a.a)({parentName:"tr"},{align:null}),"Enable automatic module installation")))),Object(l.b)("p",null,"Undefined properties are simply ignored. Refer to ",Object(l.b)("a",Object(a.a)({parentName:"p"},{href:"../getting-started/auto-install"}),"auto-install")," section for details."),Object(l.b)("h3",{id:"series"},"series()"),Object(l.b)("pre",null,Object(l.b)("code",Object(a.a)({parentName:"pre"},{className:"language-js"}),"series(...args: BuildSet[]) => BuildSetSeries;\n")),Object(l.b)("p",null,"Convert argument list into series type build set."),Object(l.b)("h3",{id:"parallel"},"parallel()"),Object(l.b)("pre",null,Object(l.b)("code",Object(a.a)({parentName:"pre"},{className:"language-js"}),"parallel(...args: BuildSet[]) => BuildSetParallel;\n")),Object(l.b)("p",null,"Convert argument list into parallel type build set"),Object(l.b)("h3",{id:"registerextension"},"registerExtension()"),Object(l.b)("pre",null,Object(l.b)("code",Object(a.a)({parentName:"pre"},{className:"language-js"}),"registerExtension(name: string, ext: RTBExtension) => void;\n")),Object(l.b)("p",null,"Register RTB extension under the given name. Refer to ",Object(l.b)("a",Object(a.a)({parentName:"p"},{href:"../guide/extension"}),"Extension")," for details."),Object(l.b)("h3",{id:"loadextension"},"loadExtension()"),Object(l.b)("pre",null,Object(l.b)("code",Object(a.a)({parentName:"pre"},{className:"language-js"}),"loadExtension(globModules: string | string[]) => void;\n")),Object(l.b)("p",null,"Load extension modules from the files specified by globModules. globModules can be single glob expression or array of glob expressions for the extension files. Refer to ",Object(l.b)("a",Object(a.a)({parentName:"p"},{href:"../guide/extension"}),"Extension")," for details."),Object(l.b)("h3",{id:"require"},"require()"),Object(l.b)("pre",null,Object(l.b)("code",Object(a.a)({parentName:"pre"},{className:"language-js"}),"require(id: string) => any;\n")),Object(l.b)("p",null,"Load module identified id. This is the same as node require() function except that it check module automatic Installation option. If automatic installation is enabled and the module(id) is not installed, then it is installed before it is loaded. Refer to ",Object(l.b)("a",Object(a.a)({parentName:"p"},{href:"../getting-started/auto-install#auto-install-for-users"}),"auto-install")," for details."),Object(l.b)("h2",{id:"properties"},"Properties"),Object(l.b)("h3",{id:"conf"},"conf"),Object(l.b)("p",null,"Global RTB list which contains all the RTB instances created."),Object(l.b)("h3",{id:"rtbs"},"rtbs"),Object(l.b)("p",null,"Global RTB list which contains all the RTB instances created."),Object(l.b)("h3",{id:"builders"},"builders"),Object(l.b)("p",null,"Object containing all the built-in builder classes, which can be used in custom builder creation."),Object(l.b)("h4",{id:"usage"},"Usage"),Object(l.b)("pre",null,Object(l.b)("code",Object(a.a)({parentName:"pre"},{className:"language-js"}),"const tron = require('gulp-tron');\n\nclass MyBuilder extends tron.builders.GBuilder {\n    // ...\n}\n")),Object(l.b)("h3",{id:"utils"},"utils"),Object(l.b)("p",null,"Object containing built-in utilities."),Object(l.b)("pre",null,Object(l.b)("code",Object(a.a)({parentName:"pre"},{className:"language-js"}),"tron.utils.is.Array() => boolean;\ntron.utils.is.Object() => boolean;\ntron.utils.is.Arguments() => boolean;\ntron.utils.is.Function() => boolean;\ntron.utils.is.String() => boolean;\ntron.utils.is.Number() => boolean;\ntron.utils.is.Date() => boolean;\ntron.utils.is.RegExp() => boolean;\ntron.utils.is.Error() => boolean;\ntron.utils.is.Symbol() => boolean;\ntron.utils.is.Map() => boolean;\ntron.utils.is.WeakMap() => boolean;\ntron.utils.is.Set() => boolean;\ntron.utils.is.WeakSet() => boolean;\n\n//** convert arg into array if it is not\ntron.utils.arrayify<T>(arg?: T | T[]) => T;\n\n//** copy multi-glob files to single destination */\ntron.utils.copy(patterns: string | string[], destPath: string) => Promise<unknown>;\n\n//** load yml and json files\ntron.utils.loadData(globPatterns: string | string[]) => Object;\n\ntron.utils.wait = (msec: number) => Promise;\n")))}s.isMDXComponent=!0},99:function(e,t,n){"use strict";n.d(t,"a",(function(){return u})),n.d(t,"b",(function(){return j}));var a=n(0),r=n.n(a);function l(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function b(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){l(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function c(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},l=Object.keys(e);for(a=0;a<l.length;a++)n=l[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(a=0;a<l.length;a++)n=l[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var o=r.a.createContext({}),s=function(e){var t=r.a.useContext(o),n=t;return e&&(n="function"==typeof e?e(t):b(b({},t),e)),n},u=function(e){var t=s(e.components);return r.a.createElement(o.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return r.a.createElement(r.a.Fragment,{},t)}},d=r.a.forwardRef((function(e,t){var n=e.components,a=e.mdxType,l=e.originalType,i=e.parentName,o=c(e,["components","mdxType","originalType","parentName"]),u=s(n),d=a,j=u["".concat(i,".").concat(d)]||u[d]||p[d]||l;return n?r.a.createElement(j,b(b({ref:t},o),{},{components:n})):r.a.createElement(j,b({ref:t},o))}));function j(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var l=n.length,i=new Array(l);i[0]=d;var b={};for(var c in t)hasOwnProperty.call(t,c)&&(b[c]=t[c]);b.originalType=e,b.mdxType="string"==typeof e?e:a,i[1]=b;for(var o=2;o<l;o++)i[o]=n[o];return r.a.createElement.apply(null,i)}return r.a.createElement.apply(null,n)}d.displayName="MDXCreateElement"}}]);