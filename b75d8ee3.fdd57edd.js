(window.webpackJsonp=window.webpackJsonp||[]).push([[23],{80:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return a})),n.d(t,"metadata",(function(){return l})),n.d(t,"rightToc",(function(){return c})),n.d(t,"default",(function(){return p}));var i=n(2),r=n(6),o=(n(0),n(99)),a={title:"GWebpackBuilder"},l={unversionedId:"builtin-builders/GWebpackBuilder",id:"builtin-builders/GWebpackBuilder",isDocsHomePage:!1,title:"GWebpackBuilder",description:"Webpack project builder. When it starts, webpack configuration file is loaded first if available. And then, it is overridden with BuildConfig.moduleOptions.webpack settings if available. Finally, the entry points and output settings are overridden again with BuildConfig.src, BuildConfig.dest, BuildConfig.outFile.",source:"@site/docs\\builtin-builders\\GWebpackBuilder.md",slug:"/builtin-builders/GWebpackBuilder",permalink:"/gulp-tron/builtin-builders/GWebpackBuilder",editUrl:"https://github.com/facebook/docusaurus/edit/master/website/docs/builtin-builders/GWebpackBuilder.md",version:"current",sidebar:"docs",previous:{title:"GTypeScriptBuilder",permalink:"/gulp-tron/builtin-builders/GTypeScriptBuilder"},next:{title:"GZipBuilder",permalink:"/gulp-tron/builtin-builders/GZipBuilder"}},c=[{value:"Builder specific Options",id:"builder-specific-options",children:[]},{value:"Example",id:"example",children:[]}],u={rightToc:c};function p(e){var t=e.components,n=Object(r.a)(e,["components"]);return Object(o.b)("wrapper",Object(i.a)({},u,n,{components:t,mdxType:"MDXLayout"}),Object(o.b)("p",null,"Webpack project builder. When it starts, webpack configuration file is loaded first if available. And then, it is overridden with BuildConfig.moduleOptions.webpack settings if available. Finally, the entry points and output settings are overridden again with BuildConfig.src, BuildConfig.dest, BuildConfig.outFile."),Object(o.b)("h3",{id:"builder-specific-options"},"Builder specific Options"),Object(o.b)("p",null,"Available options for BuildConfig.buildOptions:"),Object(o.b)("table",null,Object(o.b)("thead",{parentName:"table"},Object(o.b)("tr",{parentName:"thead"},Object(o.b)("th",Object(i.a)({parentName:"tr"},{align:null}),"Option"),Object(o.b)("th",Object(i.a)({parentName:"tr"},{align:null}),"Type"),Object(o.b)("th",Object(i.a)({parentName:"tr"},{align:null}),"Default"),Object(o.b)("th",Object(i.a)({parentName:"tr"},{align:null}),"Description"))),Object(o.b)("tbody",{parentName:"table"},Object(o.b)("tr",{parentName:"tbody"},Object(o.b)("td",Object(i.a)({parentName:"tr"},{align:null}),"webpackConfig"),Object(o.b)("td",Object(i.a)({parentName:"tr"},{align:null}),"string"),Object(o.b)("td",Object(i.a)({parentName:"tr"},{align:null}),"undefined"),Object(o.b)("td",Object(i.a)({parentName:"tr"},{align:null}),"Path to webpack configuration file.")))),Object(o.b)("h4",{id:"notes"},"Notes"),Object(o.b)("ul",null,Object(o.b)("li",{parentName:"ul"},"If BuildConfig.src is specified, it will override the 'entry' value of webpack configuration. A string or an array of string is allowed, but it cannot specify multiple entry points. To configure multiple entry points, use moduleOptions.webpack option or separate webpack configuration file."),Object(o.b)("li",{parentName:"ul"},"If BuildConfig.dest is specified, it will override output.path of webpack configuration."),Object(o.b)("li",{parentName:"ul"},"If BuildConfig.outFile is specified, it will override output.filename of webpack configuration."),Object(o.b)("li",{parentName:"ul"},"To enable sourceMap, add devtool option to webpack configuration file. For more details, refer to webpack documentation on ",Object(o.b)("a",Object(i.a)({parentName:"li"},{href:"https://webpack.js.org/configuration/devtool/"}),"Devtool"),'{:target="_blank"}.')),Object(o.b)("h3",{id:"example"},"Example"),Object(o.b)("pre",null,Object(o.b)("code",Object(i.a)({parentName:"pre"},{className:"language-js"}),"const tron = require('gulp-tron');\nconst path = require('path');\nconst srcRoot = 'assets';\nconst destRoot = '_build';\n\n// build configuration\nconst webpack = {\n    name: 'webpack',\n    builder: 'GWebpackBuilder',\n\n    // This will finally override the webpack configuration\n    // src: [path.join(srcRoot, 'scripts/ts/app.ts')],\n    // dest: path.join(destRoot, 'jss'),\n    // outFile: 'sample-ts.js',\n    buildOptions: {\n        webpackConfig: 'webpack.config.js'\n    },\n    moduleOptions: {\n        // webpack configuration comes here. This will override webpack configuration file.\n        webpack: {\n            //   entry: path.resolve(srcRoot, 'scripts/ts/greet.ts'),\n            //   mode: 'production',\n            //   devtool: 'source-map',\n            //   module: {\n            //     rules: [\n            //       {\n            //         test: /\\.tsx?$/,\n            //         use: 'ts-loader',\n            //         exclude: /node_modules/\n            //       }\n            //     ],\n            //   },\n            //   resolve: {\n            //     extensions: ['.tsx', '.ts', '.js']\n            //   },\n            //   output: {\n            //     filename: 'bundle.js',\n            //     path: path.resolve(destRoot, 'js')\n            //   },\n        },\n    }\n};\n")))}p.isMDXComponent=!0},99:function(e,t,n){"use strict";n.d(t,"a",(function(){return s})),n.d(t,"b",(function(){return f}));var i=n(0),r=n.n(i);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);t&&(i=i.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,i)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function c(e,t){if(null==e)return{};var n,i,r=function(e,t){if(null==e)return{};var n,i,r={},o=Object.keys(e);for(i=0;i<o.length;i++)n=o[i],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(i=0;i<o.length;i++)n=o[i],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var u=r.a.createContext({}),p=function(e){var t=r.a.useContext(u),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},s=function(e){var t=p(e.components);return r.a.createElement(u.Provider,{value:t},e.children)},b={inlineCode:"code",wrapper:function(e){var t=e.children;return r.a.createElement(r.a.Fragment,{},t)}},d=r.a.forwardRef((function(e,t){var n=e.components,i=e.mdxType,o=e.originalType,a=e.parentName,u=c(e,["components","mdxType","originalType","parentName"]),s=p(n),d=i,f=s["".concat(a,".").concat(d)]||s[d]||b[d]||o;return n?r.a.createElement(f,l(l({ref:t},u),{},{components:n})):r.a.createElement(f,l({ref:t},u))}));function f(e,t){var n=arguments,i=t&&t.mdxType;if("string"==typeof e||i){var o=n.length,a=new Array(o);a[0]=d;var l={};for(var c in t)hasOwnProperty.call(t,c)&&(l[c]=t[c]);l.originalType=e,l.mdxType="string"==typeof e?e:i,a[1]=l;for(var u=2;u<o;u++)a[u]=n[u];return r.a.createElement.apply(null,a)}return r.a.createElement.apply(null,n)}d.displayName="MDXCreateElement"}}]);