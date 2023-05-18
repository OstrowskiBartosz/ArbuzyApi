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

const newWeeklyPromo = async () => {
  const transaction = await db.sequelize.transaction();
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
    const oldPromoTagUpdate = Product.update(
      { promotionName: null, promotionDiscount: null },
      { where: { promotionName: 'weeklyPromo' } }
    );
    const newPromoTagUpdate = Product.update(
      { promotionName: 'weeklyPromo', promotionDiscount: 20 },
      { where: { productId: product.productID } }
    );
  } catch (e) {
    await transaction.rollback();
  }
};

var task = cron.schedule('0 0 * * 1', async () => {
  newWeeklyPromo();
});

task.start();
