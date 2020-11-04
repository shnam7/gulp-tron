(window.webpackJsonp=window.webpackJsonp||[]).push([[25],{84:function(e,r,n){"use strict";n.r(r),n.d(r,"frontMatter",(function(){return a})),n.d(r,"metadata",(function(){return u})),n.d(r,"rightToc",(function(){return l})),n.d(r,"default",(function(){return p}));var t=n(2),i=n(6),o=(n(0),n(98)),a={title:"GMarkdownBuilder"},u={unversionedId:"builtin-builders/GMarkdownBuilder",id:"builtin-builders/GMarkdownBuilder",isDocsHomePage:!1,title:"GMarkdownBuilder",description:"Converts markdown files into html using gulp-markdonn plugin.",source:"@site/docs/builtin-builders/GMarkdownBuilder.md",slug:"/builtin-builders/GMarkdownBuilder",permalink:"/gulp-tron/builtin-builders/GMarkdownBuilder",editUrl:"https://github.com/facebook/docusaurus/edit/master/website/docs/builtin-builders/GMarkdownBuilder.md",version:"current",sidebar:"docs",previous:{title:"GJavaScriptBuilder",permalink:"/gulp-tron/builtin-builders/GJavaScriptBuilder"},next:{title:"GPaniniBuilder",permalink:"/gulp-tron/builtin-builders/GPaniniBuilder"}},l=[{value:"Builder specific Options",id:"builder-specific-options",children:[]},{value:"Example",id:"example",children:[]}],c={rightToc:l};function p(e){var r=e.components,n=Object(i.a)(e,["components"]);return Object(o.b)("wrapper",Object(t.a)({},c,n,{components:r,mdxType:"MDXLayout"}),Object(o.b)("p",null,"Converts markdown files into html using gulp-markdonn plugin."),Object(o.b)("h3",{id:"builder-specific-options"},"Builder specific Options"),Object(o.b)("p",null,"None"),Object(o.b)("h3",{id:"example"},"Example"),Object(o.b)("pre",null,Object(o.b)("code",Object(t.a)({parentName:"pre"},{className:"language-js"}),"const markdown = {\n    name: 'markdown',\n    builder: 'GMarkdownBuilder',\n    src: [upath.join(srcRoot, '**/*.md')],\n    dest: upath.join(destRoot, ''),\n};\n")))}p.isMDXComponent=!0},98:function(e,r,n){"use strict";n.d(r,"a",(function(){return d})),n.d(r,"b",(function(){return f}));var t=n(0),i=n.n(t);function o(e,r,n){return r in e?Object.defineProperty(e,r,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[r]=n,e}function a(e,r){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var t=Object.getOwnPropertySymbols(e);r&&(t=t.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),n.push.apply(n,t)}return n}function u(e){for(var r=1;r<arguments.length;r++){var n=null!=arguments[r]?arguments[r]:{};r%2?a(Object(n),!0).forEach((function(r){o(e,r,n[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(n,r))}))}return e}function l(e,r){if(null==e)return{};var n,t,i=function(e,r){if(null==e)return{};var n,t,i={},o=Object.keys(e);for(t=0;t<o.length;t++)n=o[t],r.indexOf(n)>=0||(i[n]=e[n]);return i}(e,r);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(t=0;t<o.length;t++)n=o[t],r.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var c=i.a.createContext({}),p=function(e){var r=i.a.useContext(c),n=r;return e&&(n="function"==typeof e?e(r):u(u({},r),e)),n},d=function(e){var r=p(e.components);return i.a.createElement(c.Provider,{value:r},e.children)},s={inlineCode:"code",wrapper:function(e){var r=e.children;return i.a.createElement(i.a.Fragment,{},r)}},b=i.a.forwardRef((function(e,r){var n=e.components,t=e.mdxType,o=e.originalType,a=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),d=p(n),b=t,f=d["".concat(a,".").concat(b)]||d[b]||s[b]||o;return n?i.a.createElement(f,u(u({ref:r},c),{},{components:n})):i.a.createElement(f,u({ref:r},c))}));function f(e,r){var n=arguments,t=r&&r.mdxType;if("string"==typeof e||t){var o=n.length,a=new Array(o);a[0]=b;var u={};for(var l in r)hasOwnProperty.call(r,l)&&(u[l]=r[l]);u.originalType=e,u.mdxType="string"==typeof e?e:t,a[1]=u;for(var c=2;c<o;c++)a[c]=n[c];return i.a.createElement.apply(null,a)}return i.a.createElement.apply(null,n)}b.displayName="MDXCreateElement"}}]);