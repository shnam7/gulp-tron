(window.webpackJsonp=window.webpackJsonp||[]).push([[22],{81:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return l})),n.d(t,"metadata",(function(){return c})),n.d(t,"rightToc",(function(){return o})),n.d(t,"default",(function(){return u}));var a=n(2),r=n(6),i=(n(0),n(98)),l={id:"concept",title:"Concept"},c={unversionedId:"guide/concept",id:"guide/concept",isDocsHomePage:!1,title:"Concept",description:"gulp-tron basically focuses on two main features of gulp, task management and file streams. gulp-tron extends those two features by providing users with configuration capability which simplicifies task management and input to output file stream processing.",source:"@site/docs/guide/00-concept.md",slug:"/guide/concept",permalink:"/gulp-tron/guide/concept",editUrl:"https://github.com/facebook/docusaurus/edit/master/website/docs/guide/00-concept.md",version:"current",sidebar:"docs",previous:{title:"Automatic Module Installation",permalink:"/gulp-tron/getting-started/auto-install"},next:{title:"BuildItem",permalink:"/gulp-tron/guide/builditem"}},o=[{value:"Project",id:"project",children:[]},{value:"BuildItem",id:"builditem",children:[]},{value:"Builder",id:"builder",children:[]},{value:"RTB",id:"rtb",children:[]}],b={rightToc:o};function u(e){var t=e.components,n=Object(r.a)(e,["components"]);return Object(i.b)("wrapper",Object(a.a)({},b,n,{components:t,mdxType:"MDXLayout"}),Object(i.b)("p",null,"gulp-tron basically focuses on two main features of gulp, task management and file streams. gulp-tron extends those two features by providing users with configuration capability which simplicifies task management and input to output file stream processing."),Object(i.b)("p",null,"Typical Node project invloves multiple gulp tasks with parallel or serial dependencies. Sometimes, projects may consist of multiple sub-projects pursuing modular architecture. gulp-tron supports this by providing the concept of project. Effectly, gulp-tron is a colllection of gulp projects."),Object(i.b)("h2",{id:"project"},"Project"),Object(i.b)("p",null,"Project is basically a collection of resolved BuildConfig items to achieve common project objectives. Here, 'resolved' means each BuildConfig properties are processed and relevant gulp tasks and the RTB instances are created accordingly. Cleaners and Watchers are special kind of BuildConifg items that can be added to the project."),Object(i.b)("p",null,"BuildConfig, Cleaner, and Watcher items are resolved when they are added to the project. Typically they are added to project when the project is created, but it is also possible to add them later as necessary. In a single project, multiple cleaners or watchers can be added if necessary, even though it is not common. Cleaners and Watchers are specific to each projects and will work only for the build items within the same project scope."),Object(i.b)("p",null,"gulp-tron project can be created by calling tron.createProject()."),Object(i.b)("h2",{id:"builditem"},"BuildItem"),Object(i.b)("p",null,"Independent configuration object for creating gulp task and defining build process. Currently, following three types of BuildItem are available."),Object(i.b)("h4",{id:"buildconfig"},"BuildConfig"),Object(i.b)("p",null,"Configuration to define gulp task and the build process. It defines gulp task name to be created and optional properties that would be used during the build process execution."),Object(i.b)("h4",{id:"cleanerconfig"},"CleanerConfig"),Object(i.b)("p",null,"Configuration to define cleaner task. This is a special kind of BuildConfig with builder property set to 'cleaner'."),Object(i.b)("h4",{id:"watcherconfig"},"WatcherConfig"),Object(i.b)("p",null,"Configuration to define watcher task. This is a special kind of BuildConfig with builder property set to 'watcher'."),Object(i.b)("h2",{id:"builder"},"Builder"),Object(i.b)("p",null,"Object defining entry point of the gulp task to be executed. Following builder types are available. Refer to ",Object(i.b)("a",Object(a.a)({parentName:"p"},{href:"builders"}),"builders")," section for more details."),Object(i.b)("table",null,Object(i.b)("thead",{parentName:"table"},Object(i.b)("tr",{parentName:"thead"},Object(i.b)("th",Object(a.a)({parentName:"tr"},{align:null}),"Builder Type"),Object(i.b)("th",Object(a.a)({parentName:"tr"},{align:null}),"Description"))),Object(i.b)("tbody",{parentName:"table"},Object(i.b)("tr",{parentName:"tbody"},Object(i.b)("td",Object(a.a)({parentName:"tr"},{align:null}),"BuilderClassName"),Object(i.b)("td",Object(a.a)({parentName:"tr"},{align:null}),"Class name of built-in builder classes or the name of custom class inherited from GBuilder class. For custom class name, refer to ",Object(i.b)("a",Object(a.a)({parentName:"td"},{href:"../api/gulp-tron"}),"gulp-tron")," section and see 'customBuilderDirs' project option.")),Object(i.b)("tr",{parentName:"tbody"},Object(i.b)("td",Object(a.a)({parentName:"tr"},{align:null}),"BuildFunction"),Object(i.b)("td",Object(a.a)({parentName:"tr"},{align:null}),"Function to be executed.")),Object(i.b)("tr",{parentName:"tbody"},Object(i.b)("td",Object(a.a)({parentName:"tr"},{align:null}),"ExternalCommand"),Object(i.b)("td",Object(a.a)({parentName:"tr"},{align:null}),"Object with external command and command line arguments.")),Object(i.b)("tr",{parentName:"tbody"},Object(i.b)("td",Object(a.a)({parentName:"tr"},{align:null}),"GBuilder"),Object(i.b)("td",Object(a.a)({parentName:"tr"},{align:null}),"Gbuilder or classe instance derived from it.")),Object(i.b)("tr",{parentName:"tbody"},Object(i.b)("td",Object(a.a)({parentName:"tr"},{align:null}),"'cleaner'"),Object(i.b)("td",Object(a.a)({parentName:"tr"},{align:null}),"Literal string 'cleaner' which means built-in Clearner.")),Object(i.b)("tr",{parentName:"tbody"},Object(i.b)("td",Object(a.a)({parentName:"tr"},{align:null}),"'watcher'"),Object(i.b)("td",Object(a.a)({parentName:"tr"},{align:null}),"Literal string 'watcher' which means built-in Watcher.")))),Object(i.b)("h4",{id:"buildset"},"BuildSet"),Object(i.b)("p",null,"List of gulp task executables to define build task dependencies."),Object(i.b)("table",null,Object(i.b)("thead",{parentName:"table"},Object(i.b)("tr",{parentName:"thead"},Object(i.b)("th",Object(a.a)({parentName:"tr"},{align:null}),"BuildSet Element"),Object(i.b)("th",Object(a.a)({parentName:"tr"},{align:null}),"Description"))),Object(i.b)("tbody",{parentName:"table"},Object(i.b)("tr",{parentName:"tbody"},Object(i.b)("td",Object(a.a)({parentName:"tr"},{align:null}),"BuildName"),Object(i.b)("td",Object(a.a)({parentName:"tr"},{align:null}),"Gulp task name")),Object(i.b)("tr",{parentName:"tbody"},Object(i.b)("td",Object(a.a)({parentName:"tr"},{align:null}),"GulpTaskFunction"),Object(i.b)("td",Object(a.a)({parentName:"tr"},{align:null}),"Gulp task function that can be used in gulp.task() function.")),Object(i.b)("tr",{parentName:"tbody"},Object(i.b)("td",Object(a.a)({parentName:"tr"},{align:null}),"BuildItem"),Object(i.b)("td",Object(a.a)({parentName:"tr"},{align:null}),"gulp-tron build configuration")),Object(i.b)("tr",{parentName:"tbody"},Object(i.b)("td",Object(a.a)({parentName:"tr"},{align:null}),"BuildSetSeries"),Object(i.b)("td",Object(a.a)({parentName:"tr"},{align:null}),"List of BuildSet elements that will be executed in series")),Object(i.b)("tr",{parentName:"tbody"},Object(i.b)("td",Object(a.a)({parentName:"tr"},{align:null}),"BuildSetParallel"),Object(i.b)("td",Object(a.a)({parentName:"tr"},{align:null}),"List of BuildSet elements that will be executed in parallel")))),Object(i.b)("p",null,"BuildSet is a recurrsive collection type which can contain itself as its own element. This is used in BuildConfig to define task execution dependencies."),Object(i.b)("h2",{id:"rtb"},"RTB"),Object(i.b)("p",null,"RTB means Runtime Builder. It contains following items."),Object(i.b)("ul",null,Object(i.b)("li",{parentName:"ul"},"A name combined to gulp task that was successfully created"),Object(i.b)("li",{parentName:"ul"},"A build function that is to be executed by the combined gulp task"),Object(i.b)("li",{parentName:"ul"},"All the information required in the build process"),Object(i.b)("li",{parentName:"ul"},"API to help build process implementation")),Object(i.b)("p",null,"RTB is created when BuildConfig item is resolved (effectively, at the point BuildItem is added to a project). It has one-to-one mapping to gulp task, and available to all the build functions as frist argument."),Object(i.b)("p",null,"Note that RTB is created automatically by gulp-tron, and not meant to be created by user. It is automatically created, and automatically available to all the build processing functions as first argument."),Object(i.b)("p",null,"All the RTB API functions return RTB object itself to support call chaining such as rtb.src().debug({}).dest()..."))}u.isMDXComponent=!0},98:function(e,t,n){"use strict";n.d(t,"a",(function(){return s})),n.d(t,"b",(function(){return m}));var a=n(0),r=n.n(a);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function l(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function c(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?l(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):l(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},i=Object.keys(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var b=r.a.createContext({}),u=function(e){var t=r.a.useContext(b),n=t;return e&&(n="function"==typeof e?e(t):c(c({},t),e)),n},s=function(e){var t=u(e.components);return r.a.createElement(b.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return r.a.createElement(r.a.Fragment,{},t)}},p=r.a.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,l=e.parentName,b=o(e,["components","mdxType","originalType","parentName"]),s=u(n),p=a,m=s["".concat(l,".").concat(p)]||s[p]||d[p]||i;return n?r.a.createElement(m,c(c({ref:t},b),{},{components:n})):r.a.createElement(m,c({ref:t},b))}));function m(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,l=new Array(i);l[0]=p;var c={};for(var o in t)hasOwnProperty.call(t,o)&&(c[o]=t[o]);c.originalType=e,c.mdxType="string"==typeof e?e:a,l[1]=c;for(var b=2;b<i;b++)l[b]=n[b];return r.a.createElement.apply(null,l)}return r.a.createElement.apply(null,n)}p.displayName="MDXCreateElement"}}]);