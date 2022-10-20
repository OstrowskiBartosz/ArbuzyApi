module.exports = getProductSorting = (sortQuery) => {
  const sort = sortQuery ? sortQuery : 'domyślne';
  switch (sort) {
    case 'domyślne':
      sortBy = ['productID', 'ASC'];
      break;
    case 'cena malejąco':
      sortBy = [{ model: Price }, 'grossPrice', 'DESC'];
      break;
    case 'cena rosnąco':
      sortBy = [{ model: Price }, 'grossPrice', 'ASC'];
      break;
    case 'nazwa produktu A-Z':
      sortBy = ['productName', 'ASC'];
      break;
    case 'nazwa produktu Z-A':
      sortBy = ['productName', 'DESC'];
      break;
    default:
      sortBy = ['productID', 'ASC'];
      break;
  }
  return sortBy;
};
