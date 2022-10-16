var express = require('express');
var router = express.Router();
var sendQueryToDatabase = require('./database_connection/sendQueryToDatabase');
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

const selectAllProductsFromCart = async (userID) => {
  const sqlQuery = `SELECT * 
                    FROM produkty_w_koszykach 
                    WHERE id_uzytkownika = '${userID}';`;
  const result = await sendQueryToDatabase(sqlQuery);
  return JSON.parse(JSON.stringify(result));
};

const selectFromCart = async (userID, cartProductID) => {
  const sqlQuery = `SELECT * 
                    FROM produkty_w_koszykach 
                    WHERE id_uzytkownika = '${userID}' 
                    AND id_produktu_w_koszyku = '${cartProductID}';`;
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
                    SET ilosc = ilosc ${operationSign} 1 
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

const deleteFromCart = async (userID, productID) => {
  const sqlQuery = `DELETE 
                    FROM produkty_w_koszykach
                    WHERE id_uzytkownika = '${userID}'
                    AND id_produktu = '${productID}';`;
  const result = await sendQueryToDatabase(sqlQuery);
  return result.affectedRows;
};

const getCartData = async (userID) => {
  const sqlQuery = `SELECT x.nazwa_produktu, x.id_produktu, x.cena_brutto, x.id_produktu_w_koszyku, x.ilosc, x.zdjecie, x.id_producenta, pp.nazwa_producenta
                    FROM (  SELECT p.nazwa_produktu, p.id_produktu, c.cena_brutto, pwk.id_produktu_w_koszyku, ilosc, a.wartosc as zdjecie, p.id_producenta
                            FROM produkty_w_koszykach pwk
                            INNER JOIN produkty p ON p.id_produktu = pwk.id_produktu
                            INNER JOIN ceny c ON pwk.id_produktu=c.id_produktu
                            INNER JOIN uzytkownicy u ON pwk.id_uzytkownika=u.id_uzytkownika
                            INNER JOIN atrybuty a ON pwk.id_produktu=a.id_produktu
                            WHERE pwk.id_uzytkownika = ${userID}
                            AND a.typ = 2
                            GROUP BY p.id_produktu) AS x
                    INNER JOIN producenci pp ON x.id_producenta=pp.id_producenta;`;
  const result = await sendQueryToDatabase(sqlQuery);
  return result;
};

router.delete('/', async (req, res, next) => {
  const cartProductID = req.body.id_produktu_w_koszyku;
  const productID = req.body.id_produktu;
  const userSession = req.session.user;
  if (cartProductID && productID && userSession) {
    const userID = await selectFromUsers(userSession);
    if (userID) {
      const operationResult = await deleteFromCart(userID, productID, cartProductID);
      if (operationResult === 1) {
        res.send('Product has been removed from cart.');
      } else {
        res.send('Error deleting product from cart.');
      }
    } else {
      res.send("User doesn't exist.");
    }
  }
});

router.get('/', async (req, res, next) => {
  const userSession = req.session.user;
  if (userSession) {
    const userID = await selectFromUsers(userSession);
    if (userID) {
      const results = await getCartData(userID);
      res.send(JSON.stringify(results, null, 3));
    } else {
      res.send("User doesn't exist.");
    }
  }
});

router.post('/', async (req, res, next) => {
  const userSession = req.session.user;
  if (req.body.ilosc && req.body.id_produktu) {
    const productID = Number(req.body.id_produktu.substring(1));
    const productQuantity = req.body.ilosc;
    if (productID && productQuantity && userSession) {
      const userID = await selectFromUsers(userSession);
      if (userID) {
        const allProductsInCart = await selectAllProductsFromCart(userID);
        const cartProductIndex = allProductsInCart.findIndex((el) => el.id_produktu === productID);
        if (cartProductIndex !== -1) {
          const cartProductID = allProductsInCart[cartProductIndex].id_produktu_w_koszyku;
          const productAvailableQuantity = await selectFromProducts(productID);
          const cartProduct = await selectFromCart(userID, cartProductID);
          if (cartProduct !== null) {
            if (cartProduct.Quantity < productAvailableQuantity) {
              await updateCartQuantity(userID, cartProduct.ID, '+');
              res.send('Product has been added to cart.');
            } else {
              res.send('Quantity limit.');
            }
          }
        } else {
          await createNewCartEntry(userID, productID, productQuantity);
          res.send('Product has been added to cart.');
        }
      }
    }
  } else if (req.body.operationSign) {
    const cartProductID = req.body.cartProductID;
    const productID = req.body.productID;
    const operationSign = req.body.operationSign;
    if (userSession && operationSign && productID) {
      const userID = await selectFromUsers(userSession);
      if (userID) {
        const productAvailableQuantity = await selectFromProducts(productID);
        const cartProduct = await selectFromCart(userID, cartProductID);
        if (cartProduct !== null) {
          if (cartProduct.Quantity < productAvailableQuantity) {
            await updateCartQuantity(userID, cartProductID, operationSign);
            res.send('The quantity has been updated.');
          } else if (cartProduct.Quantity === productAvailableQuantity && operationSign === '-') {
            await updateCartQuantity(userID, cartProductID, operationSign);
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
  }
});

module.exports = router;
