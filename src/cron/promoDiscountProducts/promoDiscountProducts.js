var cron = require('node-cron');
const db = require('../../models');
const { Product, Price, sequelize } = db;

module.exports = promoDiscountProducts = async () => {
  const oldPromoTagUpdate = Product.update(
    { promotionName: null, promotionDiscount: null },
    { where: { promotionName: 'dailyDiscount' } }
  );

  for (let promoCounter = 0; promoCounter <= 5; ++promoCounter) {
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

      if (product.promotionName === null) {
        const generateDiscount = (Math.random() * (0.15 - 0.05) + 0.05).toFixed(2);
        const discountPercentage = 1 - generateDiscount;

        const price = await Price.create(
          {
            productID: product.productID,
            netPrice: ((product.Prices[0].grossPrice * discountPercentage) / 1.23).toFixed(2),
            grossPrice: (product.Prices[0].grossPrice * discountPercentage).toFixed(2),
            taxPercentage: 23,
            fromDate: new Date(),
            toDate: new Date().setHours(24, 0, 0)
          },
          { transaction }
        );
        const newPromoTagUpdate = await Product.update(
          { promotionName: 'dailyDiscount', promotionDiscount: generateDiscount * 100 },
          {
            where: { productId: product.productID },
            transaction
          }
        );

        await transaction.commit();
      } else {
        promoCounter -= 1;
        await transaction.rollback();
      }
    } catch (e) {
      await transaction.rollback();
    }
  }
};

let task = cron.schedule('0 0 * * *', async () => {
  promoDiscountProducts();
});

task.start();
