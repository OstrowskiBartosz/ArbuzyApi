const promoDailyProduct = require('./promoDailyProduct/promoDailyProduct');
const promoDiscountProducts = require('./promoDiscountProducts/promoDiscountProducts');
const promoWeeklyProduct = require('./promoWeeklyProduct/promoWeeklyProduct');

const runCrons = async () => {
  await promoDailyProduct();
  await promoDiscountProducts();
  await promoWeeklyProduct();
};

runCrons();
