(window.webpackJsonp=window.webpackJsonp||[]).push([[25],{118:function(e,t,n){"use strict";n.d(t,"a",(function(){return u})),n.d(t,"b",(function(){return s}));var r=n(0),a=n.n(r);function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function o(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function l(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?o(Object(n),!0).forEach((function(t){i(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):o(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function b(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var c=a.a.createContext({}),p=function(e){var t=a.a.useContext(c),n=t;return e&&(n="function"==typeof e?e(t):l(l({},t),e)),n},u=function(e){var t=p(e.components);return a.a.createElement(c.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return a.a.createElement(a.a.Fragment,{},t)}},O=a.a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,i=e.originalType,o=e.parentName,c=b(e,["components","mdxType","originalType","parentName"]),u=p(n),O=r,s=u["".concat(o,".").concat(O)]||u[O]||d[O]||i;return n?a.a.createElement(s,l(l({ref:t},c),{},{components:n})):a.a.createElement(s,l({ref:t},c))}));function s(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=n.length,o=new Array(i);o[0]=O;var l={};for(var b in t)hasOwnProperty.call(t,b)&&(l[b]=t[b]);l.originalType=e,l.mdxType="string"==typeof e?e:r,o[1]=l;for(var c=2;c<i;c++)o[c]=n[c];return a.a.createElement.apply(null,o)}return a.a.createElement.apply(null,n)}O.displayName="MDXCreateElement"},83:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return o})),n.d(t,"metadata",(function(){return l})),n.d(t,"rightToc",(function(){return b})),n.d(t,"default",(function(){return p}));var r=n(2),a=n(6),i=(n(0),n(118)),o={title:"ext-markdown"},l={unversionedId:"extension/markdown",id:"extension/markdown",isDocsHomePage:!1,title:"ext-markdown",description:"Markdown transpiler with optional lhtml formatting.",source:"@site/docs\\extension\\markdown.md",slug:"/extension/markdown",permalink:"/gulp-tron/extension/markdown",editUrl:"https://github.com/facebook/docusaurus/edit/master/website/docs/extension/markdown.md",version:"current",sidebar:"docs",previous:{title:"ext-javascript",permalink:"/gulp-tron/extension/javascript"},next:{title:"ext-twig",permalink:"/gulp-tron/extension/twig"}},b=[{value:"Usage",id:"usage",children:[]},{value:"Options",id:"options",children:[]},{value:"rtb.buildOptions (BuildConfig.buildOptions)",id:"rtbbuildoptions-buildconfigbuildoptions",children:[]},{value:"rtb.moduleOptions (BuildConfig.moduleOptions)",id:"rtbmoduleoptions-buildconfigmoduleoptions",children:[]},{value:"Example",id:"example",children:[]},{value:"Notes",id:"notes",children:[]}],c={rightToc:b};function p(e){var t=e.components,n=Object(a.a)(e,["components"]);return Object(i.b)("wrapper",Object(r.a)({},c,n,{components:t,mdxType:"MDXLayout"}),Object(i.b)("p",null,"Markdown transpiler with optional lhtml formatting."),Object(i.b)("h3",{id:"usage"},"Usage"),Object(i.b)("pre",null,Object(i.b)("code",Object(r.a)({parentName:"pre"},{className:"language-js"}),"rtb.markdown(options={});\n")),Object(i.b)("h3",{id:"options"},"Options"),Object(i.b)("p",null,"options will override rtb.moduleOptions."),Object(i.b)("h3",{id:"rtbbuildoptions-buildconfigbuildoptions"},"rtb.buildOptions (BuildConfig.buildOptions)"),Object(i.b)("table",null,Object(i.b)("thead",{parentName:"table"},Object(i.b)("tr",{parentName:"thead"},Object(i.b)("th",Object(r.a)({parentName:"tr"},{align:null}),"Option"),Object(i.b)("th",Object(r.a)({parentName:"tr"},{align:null}),"Type"),Object(i.b)("th",Object(r.a)({parentName:"tr"},{align:null}),"Default"),Object(i.b)("th",Object(r.a)({parentName:"tr"},{align:null}),"Description"))),Object(i.b)("tbody",{parentName:"table"},Object(i.b)("tr",{parentName:"tbody"},Object(i.b)("td",Object(r.a)({parentName:"tr"},{align:null}),"minify"),Object(i.b)("td",Object(r.a)({parentName:"tr"},{align:null}),"boolean"),Object(i.b)("td",Object(r.a)({parentName:"tr"},{align:null}),"false"),Object(i.b)("td",Object(r.a)({parentName:"tr"},{align:null}),"Minify html output.")),Object(i.b)("tr",{parentName:"tbody"},Object(i.b)("td",Object(r.a)({parentName:"tr"},{align:null}),"prettify"),Object(i.b)("td",Object(r.a)({parentName:"tr"},{align:null}),"boolean"),Object(i.b)("td",Object(r.a)({parentName:"tr"},{align:null}),"false"),Object(i.b)("td",Object(r.a)({parentName:"tr"},{align:null}),"Prettify html output.")))),Object(i.b)("h3",{id:"rtbmoduleoptions-buildconfigmoduleoptions"},"rtb.moduleOptions (BuildConfig.moduleOptions)"),Object(i.b)("table",null,Object(i.b)("thead",{parentName:"table"},Object(i.b)("tr",{parentName:"thead"},Object(i.b)("th",Object(r.a)({parentName:"tr"},{align:null}),"Property"),Object(i.b)("th",Object(r.a)({parentName:"tr"},{align:null}),"Type"),Object(i.b)("th",Object(r.a)({parentName:"tr"},{align:"center"}),"Default"),Object(i.b)("th",Object(r.a)({parentName:"tr"},{align:null}),"Description"))),Object(i.b)("tbody",{parentName:"table"},Object(i.b)("tr",{parentName:"tbody"},Object(i.b)("td",Object(r.a)({parentName:"tr"},{align:null}),"markdown"),Object(i.b)("td",Object(r.a)({parentName:"tr"},{align:null}),"Object"),Object(i.b)("td",Object(r.a)({parentName:"tr"},{align:"center"}),"{}"),Object(i.b)("td",Object(r.a)({parentName:"tr"},{align:null}),"Options to gulp-markdown.")),Object(i.b)("tr",{parentName:"tbody"},Object(i.b)("td",Object(r.a)({parentName:"tr"},{align:null}),"htmlmin"),Object(i.b)("td",Object(r.a)({parentName:"tr"},{align:null}),"Object"),Object(i.b)("td",Object(r.a)({parentName:"tr"},{align:"center"}),"{}"),Object(i.b)("td",Object(r.a)({parentName:"tr"},{align:null}),"Options to gulp-htmlmin.")),Object(i.b)("tr",{parentName:"tbody"},Object(i.b)("td",Object(r.a)({parentName:"tr"},{align:null}),"prettier"),Object(i.b)("td",Object(r.a)({parentName:"tr"},{align:null}),"Object"),Object(i.b)("td",Object(r.a)({parentName:"tr"},{align:"center"}),"{}"),Object(i.b)("td",Object(r.a)({parentName:"tr"},{align:null}),"Options to gulp-prettier.")))),Object(i.b)("h3",{id:"example"},"Example"),Object(i.b)("pre",null,Object(i.b)("code",Object(r.a)({parentName:"pre"},{className:"language-js"}),"const markdown = {\n    name: 'markdown',\n    builder: (rtb) => rtb.src().markdown().dest(),\n    src: ['assets/docs/**/*.md'],\n    dest: 'www/pages',\n    buildOptions: {\n        prettify: true,\n    },\n    moduleOptions: {\n        prettier: { useTabs: false, tabWidth: 4 },\n    }\n};\n")),Object(i.b)("h3",{id:"notes"},"Notes"),Object(i.b)("p",null,"This extension is for custom processing. Use ",Object(i.b)("a",Object(r.a)({parentName:"p"},{href:"../builtin-builders/GMarkdownBuilder"}),"GMarkdownBuilder")," for markdown file processiing."))}p.isMDXComponent=!0}}]);