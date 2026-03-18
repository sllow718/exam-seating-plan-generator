function toCamelCase(name) {
  return name
    .split(" ")
    .map((word) => {
      if (word.startsWith("(")) {
        const inner = word.slice(1).replace(")", "");
        const capitalized =
          inner.charAt(0).toUpperCase() + inner.slice(1).toLowerCase();
        return word.endsWith(")") ? "(" + capitalized + ")" : "(" + capitalized;
      }
      if (word.endsWith(")")) {
        const inner = word.slice(0, -1);
        const capitalized =
          inner.charAt(0).toUpperCase() + inner.slice(1).toLowerCase();
        return capitalized + ")";
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}
export { toCamelCase };
