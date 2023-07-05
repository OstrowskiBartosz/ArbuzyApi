const getURLParams = require('../util/product/getURLParams');
const groupFilterValues = require('../util/product/groupFilterValues');
const { getArrayFilters, getAttributeFilters, getPriceRange } = require('../util/product/getFilters');
const {
  getMostBoughtProducts,
  getMostBoughtCategoryProducts,
  getYouMayLikeThisProducts,
  getDiscountedProducts,
  getDailyPromoProduct,
  getWeeklyPromoProduct
} = require('../util/product/getFrontPageProducts/getFrontProducts');
const getProductSorting = require('../util/product/getProductSorting');
const getMinAndMaxPrice = require('../util/product/getProducts/getMinAndMaxPrice');
const getNumberOfProducts = require('../util/product/getProducts/getNumberOfProducts');
const getAttributes = require('../util/product/getProducts/getAttributes');
const getFilteredManufacturers = require('../util/product/getProducts/getFilteredManufacturers');
const getFilteredCategories = require('../util/product/getProducts/getFilteredCategories');
const getFilteredProducts = require('../util/product/getProducts/getFilteredProducts');
const db = require('../models');
const { Product, Manufacturer, Category, Attribute, Price, sequelize } = db;
const { Op } = require('sequelize');

const getProduct = async (productID) => {
  try {
    const product = await Product.findByPk(productID, {
      include: [
        { model: Manufacturer, as: 'Manufacturer' },
        { model: Category, as: 'Category' },
        { model: Price },
        { model: Attribute, as: 'Attributes', attributes: { exclude: ['productID'] } }
      ]
    });
    return { status: 200, data: product, message: 'Product retrieved' };
  } catch (e) {
    return { status: 500, data: null, message: e.message };
  }
};

const getProducts = async (productName, query, url) => {
  try {
    const productLimit = Number(query.l) ? Number(query.l) : 10;
    const pageOffset = (Number(query.p) ? Number(query.p) - 1 : 0) * productLimit;
    const sortBy = getProductSorting(query.s);
    const paramsObject = getURLParams(url, productName);

    let manufacturers = [];
    const activeManufacturers = getArrayFilters(paramsObject, 'filterManufacturer');
    activeManufacturers.map((manufacturerID) => manufacturers.push({ manufacturerID: manufacturerID }));

    let categories = [];
    const activeCategories = getArrayFilters(paramsObject, 'filterCategory');
    activeCategories.map((categoryID) => categories.push({ categoryID: categoryID }));

    const attributes = getAttributeFilters(paramsObject, productName);
    const whereLength = attributes.property.length;
    let where = whereLength > 0 ? attributes : {};
    let having = whereLength > 1 ? [sequelize.where(sequelize.literal('COUNT(Product.productID)'), '=', whereLength)] : [];

    const priceRange = getPriceRange(paramsObject);
    let priceWhere = priceRange.priceFrom
      ? { grossPrice: { [Op.between]: [priceRange.priceFrom, priceRange.priceTo] } }
      : {};

    const filteredProducts = await getFilteredProducts(
      productName,
      categories,
      manufacturers,
      priceWhere,
      where,
      whereLength,
      having,
      productLimit,
      pageOffset
    );
    const filteredCategories = await getFilteredCategories(productName, manufacturers, priceWhere, where, whereLength);
    const filteredManufacturers = await getFilteredManufacturers(productName, categories, priceWhere, where, whereLength);

    const requestedAttributes = await getAttributes(productName, categories, manufacturers, priceWhere, where, having);
    const groupedFilters = groupFilterValues(requestedAttributes);

    const [minPrice, maxPrice] = await getMinAndMaxPrice(productName, categories, manufacturers, where, having);

    const numberOfProducts = await getNumberOfProducts(productName, categories, manufacturers, priceWhere, where, having);
    const NumberOfpages = Math.ceil(numberOfProducts / productLimit);
    const activePage = pageOffset > getNumberOfProducts.length ? 1 : pageOffset / productLimit + 1;

    return {
      status: 200,
      data: {
        products: filteredProducts,
        filters: groupedFilters,
        categories: filteredCategories,
        manufacturers: filteredManufacturers,
        numberOfProducts: numberOfProducts,
        activePage: activePage,
        NumberOfpages: NumberOfpages,
        minPrice: minPrice,
        maxPrice: maxPrice
      },
      message: 'Product retrieved'
    };
  } catch (e) {
    return { status: 500, data: [], message: e.message };
  }
};

const getProductHints = async (productName) => {
  try {
    const product = await Product.findAll({
      attributes: { exclude: ['description', 'categoryID', 'manufacturerID', 'quantity'] },
      where: { productName: { [Op.like]: `%${productName}%` } },
      limit: 5
    });
    return { status: 200, data: product, message: 'Product hints retrieved.' };
  } catch (e) {
    return { status: 500, data: null, message: e.message };
  }
};

const getFrontPageProducts = async () => {
  try {
    const likedProducts = await getYouMayLikeThisProducts();
    const categoryProducts = await getMostBoughtCategoryProducts();
    const boughtProducts = await getMostBoughtProducts();
    const discountProducts = await getDiscountedProducts();
    const dailyPromoProduct = await getDailyPromoProduct();
    const weeklyPromoProduct = await getWeeklyPromoProduct();

    const products = {
      youMayLikeProducts: likedProducts ? likedProducts : null,
      mostBoughtCategoryProducts: categoryProducts ? categoryProducts : null,
      mostBoughtProducts: boughtProducts ? boughtProducts : null,
      discountProducts: discountProducts ? discountProducts : null,
      dailyPromoProduct: dailyPromoProduct ? dailyPromoProduct : null,
      weeklyPromoProduct: weeklyPromoProduct ? weeklyPromoProduct : null
    };
    return { status: 200, data: products, message: 'Products retrieved.' };
  } catch (e) {
    return { status: 500, data: null, message: e.message };
  }
};

module.exports = {
  getProduct,
  getProducts,
  getProductHints,
  getFrontPageProducts
};
