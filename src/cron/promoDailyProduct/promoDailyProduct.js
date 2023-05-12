var cron = require('node-cron');
const db = require('../../models');
const { Product, Price, sequelize } = db;

var task = cron.schedule(
  '* * * * * *',
  async () => {
    try {
      const product = await Product.findOne({
        include: [{ model: Price }],
        order: sequelize.random(),
        limit: 1
      });
      const price = await Price.create({
        productID: product.productID,
        netPrice: product.Prices[0].grossPrice * 0.9 * 0.77,
        grossPrice: product.Prices[0].grossPrice * 0.9,
        taxPercentage: 23,
        fromDate: new Date(),
        toDate: new Date()
      });
      const productPromoUpdateOld = Product.update(
        {
          dailyPromo: false
        },
        { where: { dailyPromo: true } }
      );
      const productPromoUpdateNew = Product.update(
        {
          dailyPromo: true
        },
        { where: { productId: product.productID } }
      );
    } catch (e) {}
  },
  {
    scheduled: true
  }
);

task.start();
