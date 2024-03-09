import { getSub1Node } from './sub-1.js'
import { getSub2Node } from './sub-2.js'

await Promise.resolve()

class TSContainer {
    // ES2022: initializer syntax
    protected _title = 'Typescript'
    protected _style

    // ES2022: Static class properties
    static staticProperty = 'typescriptIsCool'

    constructor() {
        this._style = `
            position: relative;
            border: 1px solid gray;
            padding: 0 1rem;
        `
    }

    render(root: HTMLElement | null) {
        if (!root)
            throw Error(`typescript:Invalid root root node`)

        const title = document.createElement('h1')
        title.innerText = this._title

        root.style.cssText = this._style
        root.appendChild(title)
        root.appendChild(getSub1Node())
        root.appendChild(getSub2Node())
    }
}

let container = new TSContainer()
container.render(document.getElementById('typescript'))
