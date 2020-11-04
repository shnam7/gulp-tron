(window.webpackJsonp=window.webpackJsonp||[]).push([[33],{92:function(e,n,r){"use strict";r.r(n),r.d(n,"frontMatter",(function(){return c})),r.d(n,"metadata",(function(){return i})),r.d(n,"rightToc",(function(){return u})),r.d(n,"default",(function(){return p}));var t=r(2),o=r(6),a=(r(0),r(98)),c={title:"Modular Configuration"},i={unversionedId:"resource/modular-configuration",id:"resource/modular-configuration",isDocsHomePage:!1,title:"Modular Configuration",description:"gulp-tron is designed with managing mulple sub-projects in mind. Typically, main gulpfile located in project root loads each gulpfiles from sub-projects. Each sub project, typically located in its own sub-directory, can have its own gulpfile using gulp-tron.",source:"@site/docs/resource/modular-configuration.md",slug:"/resource/modular-configuration",permalink:"/gulp-tron/resource/modular-configuration",editUrl:"https://github.com/facebook/docusaurus/edit/master/website/docs/resource/modular-configuration.md",version:"current"},u=[{value:"Quick Example",id:"quick-example",children:[]}],l={rightToc:u};function p(e){var n=e.components,r=Object(o.a)(e,["components"]);return Object(a.b)("wrapper",Object(t.a)({},l,r,{components:n,mdxType:"MDXLayout"}),Object(a.b)("p",null,"gulp-tron is designed with managing mulple sub-projects in mind. Typically, main gulpfile located in project root loads each gulpfiles from sub-projects. Each sub project, typically located in its own sub-directory, can have its own gulpfile using gulp-tron."),Object(a.b)("h2",{id:"quick-example"},"Quick Example"),Object(a.b)("pre",null,Object(a.b)("code",Object(t.a)({parentName:"pre"},{className:"language-js"}),"// file: 'docs/gulpfile.js\nconst tron = require('gulp-tron');\n\n// make some BuildConfig's\n// ...\n\nmodule.exports = tron.createProject(/*...*/);\n")),Object(a.b)("pre",null,Object(a.b)("code",Object(t.a)({parentName:"pre"},{className:"language-js"}),"// file: 'example/gulpfile.js\nconst tron = require('gulp-tron');\n\n// make some BuildConfig's\n// ...\n\nmodule.exports = tron.createProject(/*...*/);\n")),Object(a.b)("pre",null,Object(a.b)("code",Object(t.a)({parentName:"pre"},{className:"language-js"}),"// file: 'gulpfile.js\nconst tron = require('gulp-tron');\n\nconst docs = require('./docs/gulpfile.js');     // docs is an instance of gulp-tron project\nconst example = require('./example/gulp.js');   // example is an instance of gulp-tron project\n")),Object(a.b)("p",null,"Check ",Object(a.b)("strong",{parentName:"p"},Object(a.b)("a",Object(t.a)({parentName:"strong"},{href:"https://github.com/shnam7/gulp-tron-samples"}),"samples"))," for more examples."))}p.isMDXComponent=!0},98:function(e,n,r){"use strict";r.d(n,"a",(function(){return s})),r.d(n,"b",(function(){return d}));var t=r(0),o=r.n(t);function a(e,n,r){return n in e?Object.defineProperty(e,n,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[n]=r,e}function c(e,n){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var t=Object.getOwnPropertySymbols(e);n&&(t=t.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),r.push.apply(r,t)}return r}function i(e){for(var n=1;n<arguments.length;n++){var r=null!=arguments[n]?arguments[n]:{};n%2?c(Object(r),!0).forEach((function(n){a(e,n,r[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):c(Object(r)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(r,n))}))}return e}function u(e,n){if(null==e)return{};var r,t,o=function(e,n){if(null==e)return{};var r,t,o={},a=Object.keys(e);for(t=0;t<a.length;t++)r=a[t],n.indexOf(r)>=0||(o[r]=e[r]);return o}(e,n);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(t=0;t<a.length;t++)r=a[t],n.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(o[r]=e[r])}return o}var l=o.a.createContext({}),p=function(e){var n=o.a.useContext(l),r=n;return e&&(r="function"==typeof e?e(n):i(i({},n),e)),r},s=function(e){var n=p(e.components);return o.a.createElement(l.Provider,{value:n},e.children)},m={inlineCode:"code",wrapper:function(e){var n=e.children;return o.a.createElement(o.a.Fragment,{},n)}},f=o.a.forwardRef((function(e,n){var r=e.components,t=e.mdxType,a=e.originalType,c=e.parentName,l=u(e,["components","mdxType","originalType","parentName"]),s=p(r),f=t,d=s["".concat(c,".").concat(f)]||s[f]||m[f]||a;return r?o.a.createElement(d,i(i({ref:n},l),{},{components:r})):o.a.createElement(d,i({ref:n},l))}));function d(e,n){var r=arguments,t=n&&n.mdxType;if("string"==typeof e||t){var a=r.length,c=new Array(a);c[0]=f;var i={};for(var u in n)hasOwnProperty.call(n,u)&&(i[u]=n[u]);i.originalType=e,i.mdxType="string"==typeof e?e:t,c[1]=i;for(var l=2;l<a;l++)c[l]=r[l];return o.a.createElement.apply(null,c)}return o.a.createElement.apply(null,r)}f.displayName="MDXCreateElement"}}]);