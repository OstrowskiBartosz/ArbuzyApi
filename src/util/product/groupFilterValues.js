module.exports = groupFilterValues = (attribute) => {
  let groupedFilters = [];
  let propertyValues = [];
  let numberOfProductsInProperty = 0;
  let savedPropertyName = '';
  attribute.forEach((item, index) => {
    if (item.property !== savedPropertyName) {
      propertyValues.sort((a, b) => {
        return b.value - a.value;
      });
      groupedFilters.push({
        property: savedPropertyName,
        numberOfProducts: numberOfProductsInProperty,
        values: propertyValues
      });
      propertyValues = [];
      numberOfProductsInProperty = 0;
      propertyName = '';
    }

    savedPropertyName = item.property;
    propertyValues.push({
      property: item.property,
      value: item.value,
      numberOfProducts: item.dataValues.numberOfProducts
    });
    numberOfProductsInProperty += item.dataValues.numberOfProducts;
    if (index === attribute.length - 1) {
      propertyValues.sort((a, b) => {
        return b.value - a.value;
      });
      groupedFilters.push({
        property: savedPropertyName,
        numberOfProducts: numberOfProductsInProperty,
        values: propertyValues
      });
    }
  });
  groupedFilters.splice(0, 1);
  return groupedFilters;
};
