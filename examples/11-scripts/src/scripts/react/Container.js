import { jsx as _jsx } from "react/jsx-runtime";
export default function Container({ children }) {
    return (_jsx("div", { style: {
            position: "relative",
            border: "1px solid gray",
            padding: "0 1rem",
        }, children: children }));
}
