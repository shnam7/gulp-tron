export const getSub2Node = (): HTMLParagraphElement => {
  const node = document.createElement("p");
  node.textContent = "This is a node from sub #2";
  return node;
};
