const container = document.querySelector("#vanilla");
console.log("container", container);

container.style.cssText = `
    position: relative;
    border: 1px solid gray;
    padding: 0 1rem;
`;

const title = document.createElement("h1");
title.textContent = "Vanilla JavaScript";

container.append(title);
container.append(getSub1Node());
container.append(getSub2Node());
