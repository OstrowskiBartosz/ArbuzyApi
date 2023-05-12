var cron = require('node-cron');
const db = require('../../models');
const { Product, Price, sequelize } = db;

const getSundaysDate = () => {
  const todaysDate = new Date();
  const todaysDay = todaysDate.getDay();
  const nextSunday = new Date();
  nextSunday.setDate(todaysDate.getDate() + (6 - todaysDay));
  return nextSunday;
};

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
        toDate: getSundaysDate()
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
