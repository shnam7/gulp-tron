export const getSub1Node = (): HTMLParagraphElement => {
  const node = document.createElement("p");
  node.textContent = `This is a node from sub #1`;
  return node;
};
