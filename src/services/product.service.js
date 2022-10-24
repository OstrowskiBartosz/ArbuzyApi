const getURLParams = require('../util/product/getURLParams');
const groupFilterValues = require('../util/product/groupFilterValues');
const {
  getArrayFilters,
  getAttributeFilters,
  getPriceRange
} = require('../util/product/getFilters');
const getProductSorting = require('../util/product/getProductSorting');
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
    throw Error(e);
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
    activeManufacturers.map((ID) => manufacturers.push({ manufacturerID: ID }));

    let categories = [];
    const activeCategories = getArrayFilters(paramsObject, 'filterCategory');
    activeCategories.map((el) => categories.push({ categoryID: el }));

    const attributes = getAttributeFilters(paramsObject, productName);
    const whereLength = attributes.property.length;
    let where = whereLength > 0 ? attributes : {};
    let having =
      whereLength > 1
        ? [sequelize.where(sequelize.literal('COUNT(Product.productID)'), '=', whereLength)]
        : [];

    const priceRange = getPriceRange(paramsObject);
    let priceWhere = priceRange.priceFrom
      ? { grossPrice: { [Op.between]: [priceRange.priceFrom, priceRange.priceTo] } }
      : {};

    const getNumberOfProducts = await Product.findAll({
      as: 'Product',
      attributes: ['productID'],
      include: [
        {
          model: Attribute,
          as: 'va',
          attributes: [],
          where: where
        },
        {
          model: Category,
          as: 'Category',
          attributes: [],
          where: categories.length !== 0 ? { [Op.or]: categories } : {}
        },
        {
          model: Manufacturer,
          as: 'Manufacturer',
          attributes: [],
          where: manufacturers.length !== 0 ? { [Op.or]: manufacturers } : {}
        },
        {
          model: Price,
          attributes: ['grossPrice'],
          where: priceWhere
        }
      ],
      where: {
        productName: { [Op.like]: `%${productName}%` }
      },
      group: ['Product.productID'],
      having: having,
      subQuery: false
    });

    const getMinAndMaxPrice = await Price.findAll({
      attributes: [
        [sequelize.fn('min', sequelize.col('grossPrice')), 'minPrice'],
        [sequelize.fn('max', sequelize.col('grossPrice')), 'maxPrice']
      ],
      include: [
        {
          model: Product,
          as: 'Product',
          attributes: ['productID'],
          include: [
            {
              model: Attribute,
              as: 'va',
              attributes: [],
              where: where
            },
            {
              model: Category,
              as: 'Category',
              attributes: [],
              where: categories.length !== 0 ? { [Op.or]: categories } : {}
            },
            {
              model: Manufacturer,
              as: 'Manufacturer',
              attributes: [],
              where: manufacturers.length !== 0 ? { [Op.or]: manufacturers } : {}
            }
          ],
          where: {
            productName: { [Op.like]: `%${productName}%` }
          },
          group: ['Product.productID'],
          having: having,
          subQuery: false
        }
      ],
      raw: true
    });

    const product = await Product.findAll({
      as: 'Product',
      attributes: { exclude: ['description', 'categoryID', 'manufacturerID'] },
      separate: true,
      include: [
        {
          model: Attribute,
          as: 'va',
          separate: whereLength > 0 ? false : true,
          attributes: ['attributeID'],
          where: where
        },
        {
          model: Attribute,
          as: 'Attributes',
          attributes: {
            exclude: ['productID', 'attributeID', 'type']
          },
          separate: true,
          where: { [Op.or]: [{ type: 1 }, { type: 2 }] }
        },
        {
          model: Category,
          as: 'Category',
          where: categories.length !== 0 ? { [Op.or]: categories } : {}
        },
        {
          model: Manufacturer,
          as: 'Manufacturer',
          where: manufacturers.length !== 0 ? { [Op.or]: manufacturers } : {}
        },
        {
          model: Price,
          attributes: { exclude: ['priceID', 'productID', 'taxPercentage', 'fromDate', 'toDate'] },
          where: priceWhere
        }
      ],
      where: { productName: { [Op.like]: `%${productName}%` } },
      group: ['Product.productID'],
      having: having,
      order: [sortBy],
      limit: [productLimit],
      offset: pageOffset > getNumberOfProducts.length ? 0 : pageOffset,
      subQuery: false
    });

    const category = await Category.findAll({
      as: 'Category',
      attributes: [
        'categoryName',
        'categoryID',
        [sequelize.fn('COUNT', sequelize.col('Product.productID')), 'numberOfProducts']
      ],
      include: [
        {
          model: Product,
          as: 'Product',
          attributes: [],
          include: [
            {
              model: Manufacturer,
              as: 'Manufacturer',
              where: manufacturers.length !== 0 ? { [Op.or]: manufacturers } : {}
            },
            {
              model: Attribute,
              as: 'va',
              separate: whereLength > 0 ? false : true,
              attributes: [],
              where: where
            },
            {
              model: Price,
              attributes: [],
              where: priceWhere
            }
          ],
          where: { productName: { [Op.like]: `%${productName}%` } }
        }
      ],
      group: ['categoryName']
    });

    const manufacturer = await Manufacturer.findAll({
      as: 'Manufacturer',
      attributes: [
        'ManufacturerName',
        'ManufacturerID',
        [sequelize.fn('COUNT', sequelize.col('Product.productID')), 'numberOfProducts']
      ],
      include: [
        {
          model: Product,
          as: 'Product',
          attributes: [],
          include: [
            {
              model: Category,
              as: 'Category',
              where: categories.length !== 0 ? { [Op.or]: categories } : {}
            },
            {
              model: Attribute,
              as: 'va',
              separate: whereLength > 0 ? false : true,
              attributes: [],
              where: where
            },
            {
              model: Price,
              attributes: [],
              where: priceWhere
            }
          ],
          where: { productName: { [Op.like]: `%${productName}%` } }
        }
      ],
      group: ['ManufacturerName']
    });

    const attribute = await Attribute.findAll({
      attributes: [
        'property',
        'value',
        [sequelize.literal('COUNT(DISTINCT Attribute.attributeID)'), 'numberOfProducts']
      ],
      include: [
        {
          model: Product,
          as: 'Product',
          attributes: ['productID'],
          group: ['productID'],
          include: [
            {
              model: Category,
              as: 'Category',
              attributes: [],
              where: categories.length !== 0 ? { [Op.or]: categories } : {}
            },
            {
              model: Manufacturer,
              as: 'Manufacturer',
              attributes: [],
              where: manufacturers.length !== 0 ? { [Op.or]: manufacturers } : {}
            },
            {
              model: Attribute,
              as: 'va',
              separate: whereLength > 0 ? false : true,
              attributes: ['attributeID'],
              where: where
            },
            {
              model: Price,
              attributes: [],
              where: priceWhere
            }
          ],
          where: { productName: { [Op.like]: `%${productName}%` } }
        }
      ],
      where: { [Op.or]: [{ type: 1 }, { type: 0 }] },
      group: ['value', 'property'],
      order: ['property'],
      subQuery: false,
      distinct: true
    });

    const numberOfProducts = getNumberOfProducts.length;
    const minPrice = getMinAndMaxPrice[0].minPrice;
    const maxPrice = getMinAndMaxPrice[0].maxPrice;
    const NumberOfpages = Math.ceil(numberOfProducts / productLimit);
    const activePage = pageOffset > getNumberOfProducts.length ? 1 : pageOffset / productLimit + 1;
    const groupedFilters = groupFilterValues(attribute);
    return {
      status: 200,
      data: {
        products: product,
        filters: groupedFilters,
        categories: category,
        manufacturers: manufacturer,
        numberOfProducts: numberOfProducts,
        activePage: activePage,
        NumberOfpages: NumberOfpages,
        minPrice: minPrice,
        maxPrice: maxPrice
      },
      message: 'Product retrieved'
    };
  } catch (e) {
    throw Error(e);
  }
};

const getMostBoughtProducts = async (period) => {
  try {
    const product = await Product.findAll({
      attributes: {
        exclude: ['categoryID', 'manufacturerID', 'quantity', 'description'],
        include: [
          [
            sequelize.literal(`(
                SELECT COUNT(*)
                FROM invoiceItems AS invoiceItem
                WHERE invoiceItem.productID = product.productID
            )`),
            'productsCount'
          ]
        ]
      },
      include: [
        {
          model: Price,
          attributes: {
            exclude: ['priceID', 'productID', 'netPrice', 'taxPercentage', 'fromDate', 'toDate']
          }
        },
        {
          model: Manufacturer,
          as: 'Manufacturer',
          attributes: {
            exclude: ['manufacturerID']
          }
        },
        {
          model: Attribute,
          as: 'Attributes',
          attributes: {
            exclude: ['attributeID', 'productID', 'property', 'type']
          },
          where: { type: 2 }
        }
      ],
      order: [[db.sequelize.literal('productsCount'), 'DESC']],
      limit: 6
    });
    return { status: 200, data: product, message: 'Product retrieved' };
  } catch (e) {
    throw Error(e);
  }
};

const getMostBoughtCategoryProducts = async () => {
  try {
    const product = await Product.findAll({
      attributes: {
        exclude: ['categoryID', 'manufacturerID', 'quantity', 'description'],
        include: [
          [
            sequelize.literal(`(
                SELECT COUNT(*)
                FROM invoiceItems AS invoiceItem
                WHERE invoiceItem.productID = product.productID
            )`),
            'productsCount'
          ]
        ]
      },
      where: {
        categoryID: [
          sequelize.literal(`(
            SELECT c.categoryID
            FROM invoiceItems AS i
            INNER JOIN products as p ON i.productID = p.productID
            INNER JOIN categories as c ON c.categoryID = p.categoryID
            GROUP BY c.categoryID
            ORDER BY COUNT(*) DESC
            LIMIT 1
        )`),
          'category'
        ]
      },
      include: [
        {
          model: Price,
          attributes: {
            exclude: ['priceID', 'productID', 'netPrice', 'taxPercentage', 'fromDate', 'toDate']
          }
        },
        {
          model: Manufacturer,
          as: 'Manufacturer',
          attributes: {
            exclude: ['manufacturerID']
          }
        },
        {
          model: Attribute,
          as: 'Attributes',
          attributes: {
            exclude: ['attributeID', 'productID', 'property', 'type']
          },
          where: { type: 2 }
        }
      ],
      order: [[db.sequelize.literal('productsCount'), 'DESC']],
      limit: 6
    });
    return { status: 200, data: product, message: 'Product retrieved' };
  } catch (e) {
    throw Error(e);
  }
};

const getYouMayLikeThisProducts = async () => {
  try {
    const product = await Product.findAll({
      include: [
        {
          model: Price,
          attributes: { exclude: ['priceID', 'netPrice', 'taxPercentage', 'fromDate', 'toDate'] }
        },
        {
          model: Manufacturer,
          as: 'Manufacturer',
          attributes: {
            exclude: ['manufacturerID']
          }
        },
        {
          model: Attribute,
          as: 'Attributes',
          attributes: {
            exclude: ['attributeID', 'productID', 'property', 'type']
          },
          where: { type: 2 }
        }
      ],
      attributes: { exclude: ['categoryID', 'manufacturerID', 'quantity', 'description'] },
      limit: 6,
      order: sequelize.random()
    });
    return { status: 200, data: product, message: 'Product retrieved' };
  } catch (e) {
    throw Error(e);
  }
};

module.exports = {
  getProduct,
  getProducts,
  getMostBoughtProducts,
  getMostBoughtCategoryProducts,
  getYouMayLikeThisProducts
};
