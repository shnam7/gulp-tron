import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import ReactDOM from "react-dom/client";
import Container from "./Container.js";
import Item from "./Item.js";
const app = (_jsx(_Fragment, { children: _jsxs(Container, { children: [_jsx("h1", { children: "React with Typescript" }), _jsx(Item, { id: 1 }), _jsx(Item, { id: 2 })] }) }));
const rootNode = document.querySelector("#react-app");
if (rootNode)
    ReactDOM.createRoot(rootNode).render(app);
