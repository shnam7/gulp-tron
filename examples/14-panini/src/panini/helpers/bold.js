function bold(options) {
  // options.fn(this) = Handelbars content between {{#bold}} HERE {{/bold}}
  const bolder = "<strong>" + options.fn(this) + "</strong>";
  return bolder;
}

export default bold;
