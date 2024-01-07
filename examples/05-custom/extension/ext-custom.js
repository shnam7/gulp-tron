const tron = require('gulp-tron');

tron.registerExtension('customExt1', (...args) => (rtb) => {
    console.log(`CustomExt1 called. buildName=${rtb.name} args= ${args}`);
});

tron.registerExtension('customExt2', (...args) => (rtb) => {
    console.log(`CustomExt2 called. buildName=${rtb.name} args= ${args}`);
});
