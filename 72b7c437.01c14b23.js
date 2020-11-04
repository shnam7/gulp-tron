(window.webpackJsonp=window.webpackJsonp||[]).push([[16],{75:function(e,t,r){"use strict";r.r(t),r.d(t,"frontMatter",(function(){return c})),r.d(t,"metadata",(function(){return l})),r.d(t,"rightToc",(function(){return o})),r.d(t,"default",(function(){return d}));var n=r(2),a=r(6),i=(r(0),r(98)),c={id:"project",title:"Project"},l={unversionedId:"api/project",id:"api/project",isDocsHomePage:!1,title:"Project",description:"Project can be created by calling tron.createProject().",source:"@site/docs/api/02-project.md",slug:"/api/project",permalink:"/gulp-tron/api/project",editUrl:"https://github.com/facebook/docusaurus/edit/master/website/docs/api/02-project.md",version:"current",sidebar:"docs",previous:{title:"gulp-tron",permalink:"/gulp-tron/api/gulp-tron"},next:{title:"RTB",permalink:"/gulp-tron/api/rtb"}},o=[{value:"Project API",id:"project-api",children:[{value:"addBuildItem()",id:"addbuilditem",children:[]},{value:"addBuildItems()",id:"addbuilditems",children:[]},{value:"addWatcher()",id:"addwatcher",children:[]},{value:"addCleaner()",id:"addcleaner",children:[]},{value:"addVars()",id:"addvars",children:[]},{value:"getBuildNames()",id:"getbuildnames",children:[]}]},{value:"Project Properties",id:"project-properties",children:[{value:"projectName",id:"projectname",children:[]},{value:"rtbs",id:"rtbs",children:[]},{value:"prefix",id:"prefix",children:[]},{value:"vars",id:"vars",children:[]}]}],s={rightToc:o};function d(e){var t=e.components,r=Object(a.a)(e,["components"]);return Object(i.b)("wrapper",Object(n.a)({},s,r,{components:t,mdxType:"MDXLayout"}),Object(i.b)("p",null,"Project can be created by calling tron.createProject()."),Object(i.b)("pre",null,Object(i.b)("code",Object(n.a)({parentName:"pre"},{className:"language-js"}),"const tron = require('gulp-builder-manager');\n\nconst scss = { name: 'scss', builder: 'GCSSBuilder', /*...*/}\nconst scripts = { name: 'scripts', builder: 'GTypeScriptBuilder', /*...*/}\nconst proj = tron.createProject({scss,scripts});\n")),Object(i.b)("h2",{id:"project-api"},"Project API"),Object(i.b)("h3",{id:"addbuilditem"},"addBuildItem()"),Object(i.b)("pre",null,Object(i.b)("code",Object(n.a)({parentName:"pre"},{className:"language-js"}),"addBuildItem(buildItem: BuildItem) => this;\n")),Object(i.b)("p",null,"Add single BuildItemg item to the project, after resolving it with following actions."),Object(i.b)("ul",null,Object(i.b)("li",{parentName:"ul"},"Create RTB instance connected to it."),Object(i.b)("li",{parentName:"ul"},"If project prefix is specified, it is prepended to buildItem.name. (to avoid gulp task name collision)"),Object(i.b)("li",{parentName:"ul"},"Create a gulp task, named with prefixed buildItem.name, and bind it with buildItem.builder.")),Object(i.b)("p",null,"BuildItem is typically BuildConfig, but it can also be CleanerConfig or WatcherConfig."),Object(i.b)("h3",{id:"addbuilditems"},"addBuildItems()"),Object(i.b)("pre",null,Object(i.b)("code",Object(n.a)({parentName:"pre"},{className:"language-js"}),"addBuildItems(items: BuildItem | BuildItems) => this\n")),Object(i.b)("p",null,"Add single or multiple BuildItem objects to the project."),Object(i.b)("h3",{id:"addwatcher"},"addWatcher()"),Object(i.b)("pre",null,Object(i.b)("code",Object(n.a)({parentName:"pre"},{className:"language-js"}),"addWatcher(config: string | WatcherConfig = { builder: 'watcher' }) => this\n")),Object(i.b)("p",null,"Create watcher task which monitors all the watch targets of each build items in the project. Watch targets for each BuildConfig items are determined by the following rules:"),Object(i.b)("ul",null,Object(i.b)("li",{parentName:"ul"},"If conf.watch is specified, add it to watch target."),Object(i.b)("li",{parentName:"ul"},"If conf.watch is not specified, conf.src is added to watch target."),Object(i.b)("li",{parentName:"ul"},"If conf.watch is set to empty array([]), then conf.src is not added to watch target."),Object(i.b)("li",{parentName:"ul"},"If conf.addWatch is specified, add it to watch target.")),Object(i.b)("p",null,"If the argument, config, is string, then it is understood as gulp task name."),Object(i.b)("h5",{id:"config-properties"},"config properties"),Object(i.b)("ul",null,Object(i.b)("li",{parentName:"ul"},"config.watch: additional watch targets (string | strinig[]). Glob is supported."),Object(i.b)("li",{parentName:"ul"},"config.browserSync: browser-sync module options."),Object(i.b)("li",{parentName:"ul"},"config.livereload: livereload module options.")),Object(i.b)("p",null,"If config.browserSync or config.livereload propertiers are set, then browserSync or livereload are are activated."),Object(i.b)("h3",{id:"addcleaner"},"addCleaner()"),Object(i.b)("pre",null,Object(i.b)("code",Object(n.a)({parentName:"pre"},{className:"language-js"}),"addCleaner(config: string | CleanerConfig = { builder: 'cleaner' }) => this\n")),Object(i.b)("p",null,"Create cleaner task which cleans all the clean targets of each build items in the project. Clean targets of each BuildConfig items are specified in its conf.clean property."),Object(i.b)("p",null,"If the argument, config, is string, then it is understood as gulp task name."),Object(i.b)("h5",{id:"config-properties-1"},"config properties"),Object(i.b)("ul",null,Object(i.b)("li",{parentName:"ul"},"config.clean: additional clean targets (string | strinig[]). Glob is supported.")),Object(i.b)("h3",{id:"addvars"},"addVars()"),Object(i.b)("pre",null,Object(i.b)("code",Object(n.a)({parentName:"pre"},{className:"language-js"}),"addVars(vars: { [key: string]: any }) => this;\n")),Object(i.b)("p",null,"Add key/value pairs into project-wide variable list, which is accessible using project.vars property. This is typically used to deliver project specific data to other modules in multi-project environment."),Object(i.b)("p",null,"Example"),Object(i.b)("pre",null,Object(i.b)("code",Object(n.a)({parentName:"pre"},{className:"language-js"}),"const pro = tron.createProject({scss}).addVar({ port: 1000 });\n\nconsole.log(proj.vars.port) // this will print 1000\n")),Object(i.b)("h3",{id:"getbuildnames"},"getBuildNames()"),Object(i.b)("pre",null,Object(i.b)("code",Object(n.a)({parentName:"pre"},{className:"language-js"}),"type BuildNameSelector = string | string[] | RegExp | RegExp[];\n\ngetBuildNames(selector: BuildNameSelector) => string[];\n")),Object(i.b)("p",null,"Returns the list of build names that matches the selector pattern from the build items inside the project."),Object(i.b)("h2",{id:"project-properties"},"Project Properties"),Object(i.b)("h3",{id:"projectname"},"projectName"),Object(i.b)("p",null,"Type: : string"),Object(i.b)("p",null,'projectName specified in ProjectOptions when the project instance is created. If not not available, empty string "" is returned.'),Object(i.b)("h3",{id:"rtbs"},"rtbs"),Object(i.b)("p",null,"Type: RTB[]"),Object(i.b)("p",null,"Array of RTB instances created by build items in the project."),Object(i.b)("h3",{id:"prefix"},"prefix"),Object(i.b)("p",null,"Type: string"),Object(i.b)("p",null,"prefix specified in ProjectOptions specified when the project instance is created."),Object(i.b)("h3",{id:"vars"},"vars"),Object(i.b)("p",null,"Type: {","[key:string]",": any}"),Object(i.b)("p",null,"Object with key/value pairs which were added by addVar() function. Typically, used to share data between projects and GBuildManager in multi-file projects."))}d.isMDXComponent=!0},98:function(e,t,r){"use strict";r.d(t,"a",(function(){return p})),r.d(t,"b",(function(){return j}));var n=r(0),a=r.n(n);function i(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function c(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function l(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?c(Object(r),!0).forEach((function(t){i(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):c(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function o(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},i=Object.keys(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var s=a.a.createContext({}),d=function(e){var t=a.a.useContext(s),r=t;return e&&(r="function"==typeof e?e(t):l(l({},t),e)),r},p=function(e){var t=d(e.components);return a.a.createElement(s.Provider,{value:t},e.children)},b={inlineCode:"code",wrapper:function(e){var t=e.children;return a.a.createElement(a.a.Fragment,{},t)}},u=a.a.forwardRef((function(e,t){var r=e.components,n=e.mdxType,i=e.originalType,c=e.parentName,s=o(e,["components","mdxType","originalType","parentName"]),p=d(r),u=n,j=p["".concat(c,".").concat(u)]||p[u]||b[u]||i;return r?a.a.createElement(j,l(l({ref:t},s),{},{components:r})):a.a.createElement(j,l({ref:t},s))}));function j(e,t){var r=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var i=r.length,c=new Array(i);c[0]=u;var l={};for(var o in t)hasOwnProperty.call(t,o)&&(l[o]=t[o]);l.originalType=e,l.mdxType="string"==typeof e?e:n,c[1]=l;for(var s=2;s<i;s++)c[s]=r[s];return a.a.createElement.apply(null,c)}return a.a.createElement.apply(null,r)}u.displayName="MDXCreateElement"}}]);