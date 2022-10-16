var con = require('./databaseConnection');

const queryToDataBase = async (sqlQuery) => {
  return new Promise((resolve, reject) => {
    con.query(sqlQuery, (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
};

module.exports = queryToDataBase;
