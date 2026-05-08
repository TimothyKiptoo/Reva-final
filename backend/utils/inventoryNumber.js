function slugPart(value) {
  return String(value || "NA")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "NA";
}

function buildInventoryPrefix({
  companyName,
  departmentName,
  categoryName,
  subcategoryName,
}) {
  return [
    slugPart(companyName),
    slugPart(departmentName),
    slugPart(categoryName),
    slugPart(subcategoryName),
  ].join("-");
}

function createInventoryNumber(input, sequence) {
  const prefix = buildInventoryPrefix(input);
  return `${prefix}-${String(sequence).padStart(4, "0")}`;
}

module.exports = {
  slugPart,
  buildInventoryPrefix,
  createInventoryNumber,
};
