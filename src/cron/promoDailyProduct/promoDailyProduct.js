var cron = require('node-cron');
const db = require('../../models');
const { Product, Price, sequelize } = db;

const newDailyPromo = async () => {
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
        netPrice: product.Prices[0].grossPrice * 0.8 * 0.77,
        grossPrice: product.Prices[0].grossPrice * 0.8,
        taxPercentage: 23,
        fromDate: new Date(),
        toDate: new Date().setHours(24, 00, 00)
      },
      { transaction }
    );
    const oldPromoTagUpdate = await Product.update(
      { promotionName: null, promotionDiscount: null },
      { where: { promotionName: 'dailyPromo' }, transaction }
    );
    const newPromoTagUpdate = await Product.update(
      { promotionName: 'dailyPromo', promotionDiscount: 20 },
      { where: { productId: product.productID }, transaction }
    );
    await transaction.commit();
  } catch (e) {
    await transaction.rollback();
  }
};

let task = cron.schedule('0 0 * * *', async () => {
  newDailyPromo();
});

task.start();
