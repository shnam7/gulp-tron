(window.webpackJsonp=window.webpackJsonp||[]).push([[36],{95:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return l})),n.d(t,"metadata",(function(){return u})),n.d(t,"rightToc",(function(){return b})),n.d(t,"default",(function(){return s}));var r=n(2),i=n(6),a=(n(0),n(99)),l={id:"builders",title:"Builders"},u={unversionedId:"guide/builders",id:"guide/builders",isDocsHomePage:!1,title:"Builders",description:"Builder is a property of BuildConfig defining entry point of the gulp task to be created. Curently, following builder types are available.",source:"@site/docs\\guide\\04-builders.md",slug:"/guide/builders",permalink:"/gulp-tron/guide/builders",editUrl:"https://github.com/facebook/docusaurus/edit/master/website/docs/guide/04-builders.md",version:"current",sidebar:"docs",previous:{title:"BuildItem",permalink:"/gulp-tron/guide/builditem"},next:{title:"RTB Extension",permalink:"/gulp-tron/guide/extension"}},b=[{value:"BuilderClassName",id:"builderclassname",children:[]},{value:"BuildFunction",id:"buildfunction",children:[]},{value:"ExternalCommand",id:"externalcommand",children:[]},{value:"GBuilder",id:"gbuilder",children:[{value:"Built-in Builders",id:"built-in-builders",children:[]},{value:"Custom Builders",id:"custom-builders",children:[]}]},{value:"cleaner",id:"cleaner",children:[]},{value:"watcher",id:"watcher",children:[]}],c={rightToc:b};function s(e){var t=e.components,n=Object(i.a)(e,["components"]);return Object(a.b)("wrapper",Object(r.a)({},c,n,{components:t,mdxType:"MDXLayout"}),Object(a.b)("p",null,"Builder is a property of BuildConfig defining entry point of the gulp task to be created. Curently, following builder types are available."),Object(a.b)("ul",null,Object(a.b)("li",{parentName:"ul"},"BuilderClassName"),Object(a.b)("li",{parentName:"ul"},"BuildFunction"),Object(a.b)("li",{parentName:"ul"},"ExternalCommand"),Object(a.b)("li",{parentName:"ul"},"GBuilder"),Object(a.b)("li",{parentName:"ul"},"'cleaner'"),Object(a.b)("li",{parentName:"ul"},"'watcher'")),Object(a.b)("h2",{id:"builderclassname"},"BuilderClassName"),Object(a.b)("p",null,"Class name, in string type, of built-in builders or user defined class derived from GBuilder."),Object(a.b)("p",null,"Example:"),Object(a.b)("pre",null,Object(a.b)("code",Object(r.a)({parentName:"pre"},{className:"language-js"}),"const sass = {\n    name: 'sass',\n    builder: 'GCSSBuilder',\n    // ...\n}\n")),Object(a.b)("p",null,"If BuilderClassName is used, the class definition file with the name is searched in the custom directory locations specified by ProjectOptions.customBuildDirs first. If no file found, then built-in builders are searched for the mathing. This sequence gives a chance to override built-in builder classes with the same name. If no builder is specified, default function which does nothing is assigned. Refer to ",Object(a.b)("a",Object(r.a)({parentName:"p"},{href:"../api/gulp-tron#projectoptions"}),"ProjectOptions")," for more information on customBuildDirs option."),Object(a.b)("h2",{id:"buildfunction"},"BuildFunction"),Object(a.b)("pre",null,Object(a.b)("code",Object(r.a)({parentName:"pre"},{className:"language-js"}),"type BuildFunction = (rtb: RTB, ...args: any[]) => void | Promise<unknown>;\n")),Object(a.b)("p",null,"This is a function to be executed for build process. RTB instance is passed as its first argument. If it returns promise, build task is not finished until the promise is fullfilled. Optional arguments(args) are delivered if available. Refer to ",Object(a.b)("a",Object(r.a)({parentName:"p"},{href:"extension#quick-example"}),"Extension")," for example of using optional arguments."),Object(a.b)("h4",{id:"example"},"Example:"),Object(a.b)("pre",null,Object(a.b)("code",Object(r.a)({parentName:"pre"},{className:"language-js"}),"const customFunction = {\n    name: 'customFunction',\n    builder: (rtb) => console.log('Custom builder using function(): Hello!!!', rtb.name)\n};\n")),Object(a.b)("h2",{id:"externalcommand"},"ExternalCommand"),Object(a.b)("p",null,"Builder can be an external command object with following data type:"),Object(a.b)("pre",null,Object(a.b)("code",Object(r.a)({parentName:"pre"},{className:"language-js"}),"interface ExternalCommand {\n    command: string,\n    args?: string[];\n    options?: SpawnOptions;\n}\n")),Object(a.b)("table",null,Object(a.b)("thead",{parentName:"table"},Object(a.b)("tr",{parentName:"thead"},Object(a.b)("th",Object(r.a)({parentName:"tr"},{align:null}),"property"),Object(a.b)("th",Object(r.a)({parentName:"tr"},{align:null}),"description"))),Object(a.b)("tbody",{parentName:"table"},Object(a.b)("tr",{parentName:"tbody"},Object(a.b)("td",Object(r.a)({parentName:"tr"},{align:null}),"command"),Object(a.b)("td",Object(r.a)({parentName:"tr"},{align:null}),"command name that can be executed by process.spawn() function")),Object(a.b)("tr",{parentName:"tbody"},Object(a.b)("td",Object(r.a)({parentName:"tr"},{align:null}),"args"),Object(a.b)("td",Object(r.a)({parentName:"tr"},{align:null}),"command line argument list")),Object(a.b)("tr",{parentName:"tbody"},Object(a.b)("td",Object(r.a)({parentName:"tr"},{align:null}),Object(a.b)("strong",{parentName:"td"},"options")),Object(a.b)("td",Object(r.a)({parentName:"tr"},{align:null}),"Accepts all the options for process.spawn() function and the followings")),Object(a.b)("tr",{parentName:"tbody"},Object(a.b)("td",Object(r.a)({parentName:"tr"},{align:null}),"options.silent"),Object(a.b)("td",Object(r.a)({parentName:"tr"},{align:null}),"Suppress all the output messages")),Object(a.b)("tr",{parentName:"tbody"},Object(a.b)("td",Object(r.a)({parentName:"tr"},{align:null}),"options.verbose"),Object(a.b)("td",Object(r.a)({parentName:"tr"},{align:null}),"Print excessive messages")),Object(a.b)("tr",{parentName:"tbody"},Object(a.b)("td",Object(r.a)({parentName:"tr"},{align:null}),"options.sync"),Object(a.b)("td",Object(r.a)({parentName:"tr"},{align:null}),"Excutes the command in sequence by calling order of other build routines in sync mode. Refer to ","[RTB]"," section for more information.")))),Object(a.b)("h4",{id:"example-1"},"Example:"),Object(a.b)("pre",null,Object(a.b)("code",Object(r.a)({parentName:"pre"},{className:"language-js"}),"const cmd1 = {\n    name: 'node-version',\n    builder: { command: 'node', args: ['-v'] },\n}\n")),Object(a.b)("h2",{id:"gbuilder"},"GBuilder"),Object(a.b)("p",null,"GBuilder is a built-in class that copies files listed in conf.src to conf.dest. This is a base class that all the built-in classes are derivatived from. It has a member function build() which is executed by gulp task. Custom classes can also defined by extending GBuilder and defining its own build function. If the build function returns promise, build task is not finished until the promise is fullfilled."),Object(a.b)("p",null,"GBuilder interface:"),Object(a.b)("pre",null,Object(a.b)("code",Object(r.a)({parentName:"pre"},{className:"language-js"}),"class GBuilder {\n    protected build() =>  void | Promise<unknown>;\n}\n")),Object(a.b)("h3",{id:"built-in-builders"},"Built-in Builders"),Object(a.b)("p",null,"Currently, following built-in builders are available:"),Object(a.b)("ul",null,Object(a.b)("li",{parentName:"ul"},Object(a.b)("a",Object(r.a)({parentName:"li"},{href:"../builtin-builders/GBuilder"}),"GBuilder")),Object(a.b)("li",{parentName:"ul"},Object(a.b)("a",Object(r.a)({parentName:"li"},{href:"../builtin-builders/GCoffeeScriptBuilder"}),"GCoffeeScriptBuilder")),Object(a.b)("li",{parentName:"ul"},Object(a.b)("a",Object(r.a)({parentName:"li"},{href:"../builtin-builders/GConcatBuilder"}),"GConcatBuilder")),Object(a.b)("li",{parentName:"ul"},Object(a.b)("a",Object(r.a)({parentName:"li"},{href:"../builtin-builders/GCSSBuilder"}),"GCSSBuilder")),Object(a.b)("li",{parentName:"ul"},Object(a.b)("a",Object(r.a)({parentName:"li"},{href:"../builtin-builders/GImagesBuilder"}),"GImagesBuilder")),Object(a.b)("li",{parentName:"ul"},Object(a.b)("a",Object(r.a)({parentName:"li"},{href:"../builtin-builders/GJavaScriptBuilder"}),"GJavaScriptBuilder")),Object(a.b)("li",{parentName:"ul"},Object(a.b)("a",Object(r.a)({parentName:"li"},{href:"../builtin-builders/GJekyllBuilder"}),"GJekyllBuilder")),Object(a.b)("li",{parentName:"ul"},Object(a.b)("a",Object(r.a)({parentName:"li"},{href:"../builtin-builders/GMarkdownBuilder"}),"GMarkdownBuilder")),Object(a.b)("li",{parentName:"ul"},Object(a.b)("a",Object(r.a)({parentName:"li"},{href:"../builtin-builders/GPaniniBuilder"}),"GPaniniBuilder")),Object(a.b)("li",{parentName:"ul"},Object(a.b)("a",Object(r.a)({parentName:"li"},{href:"../builtin-builders/GRTLCSSBuilder"}),"GRTLCSSBuilder")),Object(a.b)("li",{parentName:"ul"},Object(a.b)("a",Object(r.a)({parentName:"li"},{href:"../builtin-builders/GTwigBuilder"}),"GTwigBuilder")),Object(a.b)("li",{parentName:"ul"},Object(a.b)("a",Object(r.a)({parentName:"li"},{href:"../builtin-builders/GTypeScriptBuilder"}),"GTypeScriptBuilder")),Object(a.b)("li",{parentName:"ul"},Object(a.b)("a",Object(r.a)({parentName:"li"},{href:"../builtin-builders/GWebpackBuilder"}),"GWebpackBuilder")),Object(a.b)("li",{parentName:"ul"},Object(a.b)("a",Object(r.a)({parentName:"li"},{href:"../builtin-builders/GZipBuilder"}),"GZipBuilder"))),Object(a.b)("p",null,"Built-in builders are available from tron.builders property. Typically in BuildConfig, BuilderClassName is used rather than directly creating GBuilder class instances."),Object(a.b)("h4",{id:"example-2"},"Example"),Object(a.b)("pre",null,Object(a.b)("code",Object(r.a)({parentName:"pre"},{className:"language-js"}),"const tron = require('gulp-build-manafer');\n\n// using GBuilder as copy builder: copy src to dest\nconst copy1 = {\n    name: 'copy',\n    builder: new tron.builders.GBuilder,\n    src: 'www/**/*.html',\n    dest: 'www',\n}\n\n// using BuilderClass\nconst copy2 = {\n    name: 'copy',\n    builder: 'GBuilder',        // same as 'new tron.builders.GBuilder'\n    src: 'www/**/*.html',\n    dest: 'www2',\n}\n")),Object(a.b)("h3",{id:"custom-builders"},"Custom Builders"),Object(a.b)("p",null,"Custom builder class can be defined by extending tron.builders.GBuilder and redefining builder() function."),Object(a.b)("h4",{id:"example-3"},"Example"),Object(a.b)("pre",null,Object(a.b)("code",Object(r.a)({parentName:"pre"},{className:"language-js"}),"const tron = require('gulp-build-manafer');\n\n//--- custom builder with new build process\nclass CustomBuilder extends tron.builders.GBuilder {\n    constructor() { super() }\n    build() {\n        console.log(`CustomBuilder is building '${this.name}'`);\n    }\n}\n\nconst customBuilder = {\n    name: 'custom-builder',\n    builder: new CustomBuilder(),\n};\n\n\n//--- custom builder extending built-in builder\nclass CustomCSSBuilder extends tron.builders.GCSSBuilder {\n    // redefine src() function to add debug call\n    src() {\n        // print input files by overloading src() function\n        return super.src().debug({ title: 'MyCSSBuilder:' })\n    }\n}\n\nconst customCSSBuilder = {\n    name: 'custom-css-builder',\n    builder: new CustomCSSBuilder(),\n    src: upath.join(basePath, '*.scss'),\n    dest: (file) => file.base,\n    clean: [upath.join(basePath, \"sample.css\")]\n};\n")),Object(a.b)("h2",{id:"cleaner"},"cleaner"),Object(a.b)("p",null,"Predefined built-in builder, Cleaner. Refer to ",Object(a.b)("a",Object(r.a)({parentName:"p"},{href:"builditem#cleanerconfig"}),"CleanerConfig")," for more information."),Object(a.b)("h2",{id:"watcher"},"watcher"),Object(a.b)("p",null,"Predefined built-in builder, Watcher.  Refer to ",Object(a.b)("a",Object(r.a)({parentName:"p"},{href:"builditem#watcherconfig"}),"WatcherConfig")," for more information."))}s.isMDXComponent=!0},99:function(e,t,n){"use strict";n.d(t,"a",(function(){return o})),n.d(t,"b",(function(){return m}));var r=n(0),i=n.n(r);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function l(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function u(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?l(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):l(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function b(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var c=i.a.createContext({}),s=function(e){var t=i.a.useContext(c),n=t;return e&&(n="function"==typeof e?e(t):u(u({},t),e)),n},o=function(e){var t=s(e.components);return i.a.createElement(c.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return i.a.createElement(i.a.Fragment,{},t)}},p=i.a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,a=e.originalType,l=e.parentName,c=b(e,["components","mdxType","originalType","parentName"]),o=s(n),p=r,m=o["".concat(l,".").concat(p)]||o[p]||d[p]||a;return n?i.a.createElement(m,u(u({ref:t},c),{},{components:n})):i.a.createElement(m,u({ref:t},c))}));function m(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var a=n.length,l=new Array(a);l[0]=p;var u={};for(var b in t)hasOwnProperty.call(t,b)&&(u[b]=t[b]);u.originalType=e,u.mdxType="string"==typeof e?e:r,l[1]=u;for(var c=2;c<a;c++)l[c]=n[c];return i.a.createElement.apply(null,l)}return i.a.createElement.apply(null,n)}p.displayName="MDXCreateElement"}}]);