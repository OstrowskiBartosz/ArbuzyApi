var express = require('express');
var router = express.Router();
var sendQueryToDatabase = require('../database_connection/sendQueryToDatabase');

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
                    WHERE id_uzytkownika = '${userID}' 
                    AND id_produktu = '${productID}';`;
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

const updateCartQuantity = async (cartProductID) => {
  const sqlQuery = `UPDATE produkty_w_koszykach 
                    SET ilosc = ilosc + 1 
                    WHERE id_produktu_w_koszyku = '${cartProductID}';`;
  const result = await sendQueryToDatabase(sqlQuery);
  return result[0];
};

const createNewCartEntry = async (userID, productID, productQuantity) => {
  const sqlQuery = `INSERT INTO produkty_w_koszykach(id_uzytkownika, id_produktu, ilosc)
                    VALUES( ${userID}, ${productID}, ${productQuantity});`;
  const result = await sendQueryToDatabase(sqlQuery);
  return result[0];
};

router.post('/', async (req, res, next) => {
  const productID = req.body.id_produktu.substring(1);
  const productQuantity = req.body.ilosc;
  const userSession = req.session.user;

  if (productID && productQuantity && userSession) {
    const userID = await selectFromUsers(userSession);
    if (userID) {
      const productAvailableQuantity = await selectFromProducts(productID);
      const cartProduct = await selectFromCart(userID, productID);
      if (cartProduct !== null) {
        if (cartProduct.Quantity < productAvailableQuantity) {
          await updateCartQuantity(cartProduct.ID);
          res.send('Product has been added to cart.');
        } else {
          res.send('Quantity limit.');
        }
      } else {
        await createNewCartEntry(userID, productID, productQuantity);
        res.send('Product has been added to cart.');
      }
    }
  }
});

module.exports = router;
