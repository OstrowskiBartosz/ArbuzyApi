var cron = require('node-cron');
const db = require('../../models');
const { Product, Price, sequelize } = db;

const newDailyDiscountPromos = async () => {
  const transaction = await db.sequelize.transaction();
  const oldPromoTagUpdate = Product.update(
    { promotionName: null, promotionDiscount: null },
    { where: { promotionName: 'dailyDiscount' } }
  );
  for (let promoCounter = 0; promoCounter <= 5; ++promoCounter) {
    try {
      const product = await Product.findOne({
        include: [{ model: Price }],
        order: sequelize.random(),
        limit: 1
      });
      if (product.promotionName === null) {
        const randomDiscount = (Math.random() * (0.15 - 0.05) + 0.05).toFixed(2);
        const price = await Price.create({
          productID: product.productID,
          netPrice: (product.Prices[0].grossPrice * (1 - randomDiscount) * 0.77).toFixed(2),
          grossPrice: (product.Prices[0].grossPrice * (1 - randomDiscount)).toFixed(2),
          taxPercentage: 23,
          fromDate: new Date(),
          toDate: new Date().setHours(24, 00, 00)
        });
        const newPromoTagUpdate = Product.update(
          { promotionName: 'dailyDiscount', promotionDiscount: randomDiscount * 100 },
          { where: { productId: product.productID } }
        );
      } else {
        promoCounter -= 1;
      }
    } catch (e) {
      await transaction.rollback();
    }
  }
};

var task = cron.schedule('0 0 * * *', async () => {
  newDailyDiscountPromos();
});

task.start();