import type { ReactElement } from "react";
import ReactDOM from "react-dom/client";
import Container from "./Container.js";
import Item from "./Item.js";

export const app: ReactElement = (
  <>
    <Container>
      <h1>React with Typescript</h1>
      <Item id={1} />
      <Item id={2} />
    </Container>
  </>
);

export const rootNode: HTMLElement | null = document.querySelector("#react-app");
if (rootNode) ReactDOM.createRoot(rootNode).render(app);
