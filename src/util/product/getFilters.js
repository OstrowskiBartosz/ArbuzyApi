const getArrayFilters = (queryParams, filterType) => {
  const filterArray =
    queryParams[`${filterType}`] && queryParams[`${filterType}`].length > 0
      ? JSON.parse(queryParams[`${filterType}`])
      : [];
  return filterArray;
};

const getAttributeFilters = (queryParams) => {
  let attr = { property: [], value: [] };

  for (const key in queryParams) {
    if (
      key !== 's' &&
      key !== 'searchCategory' &&
      key !== 'p' &&
      key !== 'l' &&
      key !== 'w' &&
      key !== 'url' &&
      key !== 'filterCategory' &&
      key !== 'filterManufacturer'
    ) {
      const groupF = 'group_F';
      const valueF = 'value_F';
      const index2 = key.indexOf(valueF);
      const length1 = groupF.length;
      const length2 = valueF.length;
      const result1 = key.slice(length1, index2);
      const result2 = key.slice(index2 + length2);

      attr.property.push(`${result1}`);
      attr.value.push(`${result2}`);
    }
  }
  return attr;
};

module.exports = {
  getArrayFilters,
  getAttributeFilters
};
