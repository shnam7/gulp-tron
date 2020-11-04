(window.webpackJsonp=window.webpackJsonp||[]).push([[29],{88:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return l})),n.d(t,"metadata",(function(){return u})),n.d(t,"rightToc",(function(){return c})),n.d(t,"default",(function(){return s}));var r=n(2),i=n(6),o=(n(0),n(98)),l={title:"GRTLCSSBuilder"},u={unversionedId:"builtin-builders/GRTLCSSBuilder",id:"builtin-builders/GRTLCSSBuilder",isDocsHomePage:!1,title:"GRTLCSSBuilder",description:"Converts css files into rtl(right-to-left) format using gulp-rtlcss plugin.",source:"@site/docs/builtin-builders/GRTLCSSBuilder.md",slug:"/builtin-builders/GRTLCSSBuilder",permalink:"/gulp-tron/builtin-builders/GRTLCSSBuilder",editUrl:"https://github.com/facebook/docusaurus/edit/master/website/docs/builtin-builders/GRTLCSSBuilder.md",version:"current",sidebar:"docs",previous:{title:"GPaniniBuilder",permalink:"/gulp-tron/builtin-builders/GPaniniBuilder"},next:{title:"GTwigBuilder",permalink:"/gulp-tron/builtin-builders/GTwigBuilder"}},c=[{value:"Builder specific Options",id:"builder-specific-options",children:[]},{value:"Module Options",id:"module-options",children:[]},{value:"Example",id:"example",children:[]}],a={rightToc:c};function s(e){var t=e.components,n=Object(i.a)(e,["components"]);return Object(o.b)("wrapper",Object(r.a)({},a,n,{components:t,mdxType:"MDXLayout"}),Object(o.b)("p",null,"Converts css files into rtl(right-to-left) format using gulp-rtlcss plugin."),Object(o.b)("h3",{id:"builder-specific-options"},"Builder specific Options"),Object(o.b)("p",null,"None"),Object(o.b)("h3",{id:"module-options"},"Module Options"),Object(o.b)("ul",null,Object(o.b)("li",{parentName:"ul"},"BuildConfig.moduleOptions.rtlcss: Option for gulp-rtlcss module."),Object(o.b)("li",{parentName:"ul"},"BuildConfig.moduleOptions.rename: Options for gulp-rename module, which is used to change the output names.")),Object(o.b)("h3",{id:"example"},"Example"),Object(o.b)("pre",null,Object(o.b)("code",Object(r.a)({parentName:"pre"},{className:"language-javascript"}),"const rtl = {\n    name: 'rtl',\n    builder: 'GRTLCSSBuilder',\n    src: [upath.join(destRoot, 'css/*.css')],\n    dest: upath.join(destRoot, 'css'),\n    moduleOptions: {\n        // if no rename option is set, default is {suffix: '-rtl'}\n        rename: { suffix: '---rtl' }\n    },\n};\n")))}s.isMDXComponent=!0},98:function(e,t,n){"use strict";n.d(t,"a",(function(){return p})),n.d(t,"b",(function(){return f}));var r=n(0),i=n.n(r);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function l(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function u(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?l(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):l(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function c(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var a=i.a.createContext({}),s=function(e){var t=i.a.useContext(a),n=t;return e&&(n="function"==typeof e?e(t):u(u({},t),e)),n},p=function(e){var t=s(e.components);return i.a.createElement(a.Provider,{value:t},e.children)},d={inlineCode:"code",wrapper:function(e){var t=e.children;return i.a.createElement(i.a.Fragment,{},t)}},b=i.a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,o=e.originalType,l=e.parentName,a=c(e,["components","mdxType","originalType","parentName"]),p=s(n),b=r,f=p["".concat(l,".").concat(b)]||p[b]||d[b]||o;return n?i.a.createElement(f,u(u({ref:t},a),{},{components:n})):i.a.createElement(f,u({ref:t},a))}));function f(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var o=n.length,l=new Array(o);l[0]=b;var u={};for(var c in t)hasOwnProperty.call(t,c)&&(u[c]=t[c]);u.originalType=e,u.mdxType="string"==typeof e?e:r,l[1]=u;for(var a=2;a<o;a++)l[a]=n[a];return i.a.createElement.apply(null,l)}return i.a.createElement.apply(null,n)}b.displayName="MDXCreateElement"}}]);