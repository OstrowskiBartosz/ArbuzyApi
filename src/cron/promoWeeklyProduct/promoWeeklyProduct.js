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
      toDate: getMondaysDate().setHours(0, 0, 0)
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
