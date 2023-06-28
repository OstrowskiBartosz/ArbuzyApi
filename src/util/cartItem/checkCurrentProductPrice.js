module.exports = checkCurrentProductPrice = (product) => {
  const productPrice = product.promotionName
    ? product.Prices[product.Prices.length - 1].grossPrice
    : product.Prices[0].grossPrice;

  return productPrice;
};
