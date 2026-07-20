import { getSub1Node } from "./sub-1.js";
import { getSub2Node } from "./sub-2.js";

await Promise.resolve();

export class TsContainer {
  // ES2022: Static class properties
  static staticProperty = "typescriptIsCool";

  // ES2022: initializer syntax
  protected _title = "Typescript";
  protected _style;

  constructor() {
    this._style = `
            position: relative;
            border: 1px solid gray;
            padding: 0 1rem;
        `;
  }

  render(root: HTMLElement | undefined) {
    if (!root) throw new Error(`typescript:Invalid root root node`);

    const title = document.createElement("h1");
    title.textContent = this._title;

    root.style.cssText = this._style;
    root.append(title);
    root.append(getSub1Node());
    root.append(getSub2Node());
  }
}

export const container = new TsContainer();
container.render(document.querySelector<HTMLElement>("#typescript") as HTMLElement);
