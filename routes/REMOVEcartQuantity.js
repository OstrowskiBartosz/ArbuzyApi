var express = require('express');
var router = express.Router();
var sendQueryToDatabase = require('./database_connection/databaseConnection.js');
router.use(express.json());

const selectFromUsers = async (userID) => {
  const sqlQuery = `SELECT * 
                    FROM uzytkownicy 
                    WHERE login = '${userID}';`;
  const result = await sendQueryToDatabase(sqlQuery);
  return result[0].id_uzytkownika;
};

const selectFromProducts = async (productID) => {
  const sqlQuery = `SELECT * 
                    FROM produkty 
                    WHERE id_produktu = '${productID}';`;
  const result = await sendQueryToDatabase(sqlQuery);
  return result[0].ilosc_produktu;
};

const selectFromCart = async (userID, productID) => {
  const sqlQuery = `SELECT * 
                    FROM produkty_w_koszykach 
                    WHERE id_uzytkownika = ${userID} 
                    AND id_produktu_w_koszyku = ${productID};`;
  const result = await sendQueryToDatabase(sqlQuery);
  if (result.length > 0) {
    const cartProduct = {
      ID: result[0].id_produktu_w_koszyku,
      Quantity: result[0].ilosc
    };
    return cartProduct;
  } else {
    return null;
  }
};

const updateCartQuantity = async (userID, cartProductID, operationSign) => {
  const sqlQuery = `UPDATE produkty_w_koszykach 
                    SET ilosc = ilosc ${operationSign}1 
                    WHERE id_produktu_w_koszyku = '${cartProductID}'
                    AND id_uzytkownika = '${userID}';`;
  const result = await sendQueryToDatabase(sqlQuery);
  return result[0];
};

router.post('/', async (req, res, next) => {
  const userSession = req.session.user;
  const productID = req.body.id_produktu_w_koszyku;
  const operationSign = req.body.znak;

  if (userSession && operationSign && productID) {
    const userID = await selectFromUsers(userSession);
    if (userID) {
      const productAvailableQuantity = await selectFromProducts(productID);
      const cartProduct = await selectFromCart(userID, productID);
      if (cartProduct !== null) {
        if (cartProduct.Quantity < productAvailableQuantity) {
          await updateCartQuantity(userID, productID, operationSign);
          res.send('The quantity has been updated.');
        } else if (cartProduct.Quantity === productAvailableQuantity && operationSign === '-') {
          await updateCartQuantity(userID, productID, operationSign);
          res.send('The quantity has been updated.');
        } else {
          res.send('Quantity limit.');
        }
      } else {
        res.send("Product doesn't exist in cart.");
      }
    }
  } else {
    res.send("User doesn't exist.");
  }
});
module.exports = router;
