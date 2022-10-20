module.exports = getURLParams = (url, productName) => {
  const decodedURL = decodeURIComponent(url).replaceAll('+', ' ');
  const productNameIndexOf = decodedURL.indexOf(`${productName}?`);
  if (productNameIndexOf !== -1) {
    const paramsObject = {};
    const paramsArray = decodedURL.slice(productNameIndexOf + `${productName}?`.length).split('&');

    paramsArray.forEach((el) => {
      if (el.length > 0) {
        const key = el.slice(0, el.indexOf('='));
        const value = el.slice(el.indexOf('=') + 1, el.length);
        paramsObject[key] = `${value}`;
      }
    });
    return paramsObject;
  } else {
    return {};
  }
};
