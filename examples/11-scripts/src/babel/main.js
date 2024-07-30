import {getSub1NodeBabel} from './sub-1.js'
import {getSub2NodeBabel} from './sub-2.js'

await Promise.resolve()

class BabelContainer {
    // ES2022: initializer syntax
    _title = 'Babel'
    // ES2022: Static class properties
    static staticProperty = 'babelIsCool'

    constructor() {
        this._style = `
            position: relative;
            border: 1px solid gray;
            padding: 0 1rem;
        `
    }

    render(root) {
        const title = document.createElement('h1') // eslint-disable-line no-undef
        title.textContent = this._title

        root.style.cssText = this._style
        root.append(title)
        root.append(getSub1NodeBabel())
        root.append(getSub2NodeBabel())
    }
}

const container = new BabelContainer()
container.render(document.querySelector('#babel')) // eslint-disable-line no-undef
