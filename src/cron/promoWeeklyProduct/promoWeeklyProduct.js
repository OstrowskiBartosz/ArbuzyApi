var cron = require('node-cron');
const db = require('../../models');
const { Product, Price, sequelize } = db;

const getMondaysDate = () => {
  const todaysDate = new Date();
  const todaysDay = todaysDate.getDay();
  const nextMonday = new Date();
  nextMonday.setDate(nextMonday.getDate() + ((7 - nextMonday.getDay()) % 7) + 1);
  return nextMonday;
};

module.exports = promoWeeklyProduct = async () => {
  const transaction = await db.sequelize.transaction();
  try {
    const product = await Product.findOne(
      {
        include: [{ model: Price }],
        order: sequelize.random(),
        limit: 1
      },
      { transaction }
    );

    const price = await Price.create(
      {
        productID: product.productID,
        netPrice: (product.Prices[0].grossPrice * 0.9) / 1.23,
        grossPrice: product.Prices[0].grossPrice * 0.9,
        taxPercentage: 23,
        fromDate: new Date(),
        toDate: getMondaysDate().setHours(0, 0, 0)
      },
      { transaction }
    );

    const oldPromoTagUpdate = await Product.update(
      { promotionName: null, promotionDiscount: null },
      { where: { promotionName: 'weeklyPromo' }, transaction }
    );

    const newPromoTagUpdate = await Product.update(
      { promotionName: 'weeklyPromo', promotionDiscount: 20 },
      { where: { productId: product.productID }, transaction }
    );
    await transaction.commit();
  } catch (e) {
    await transaction.rollback();
  }
};

let task = cron.schedule('0 0 * * 1', async () => {
  promoWeeklyProduct();
});

task.start();
