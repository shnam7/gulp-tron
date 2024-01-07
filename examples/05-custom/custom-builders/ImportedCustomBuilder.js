/**
 * CustomTestBuilder
 */

const tron = require('gulp-tron');

class ImportedCustomBuilder extends tron.builders.GBuilder {
    constructor() { super(); }

    build() {
        console.log('GCustomBuilder::build() called. continuing the build process...');
        return super.build();
    }
}

module.exports = ImportedCustomBuilder;
