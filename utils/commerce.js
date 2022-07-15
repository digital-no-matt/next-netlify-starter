import Commercetools from './Commercetools';
import CommerceMagnoliaApi from './CommerceMagnoliaApi';

function hasJsonStructure(str) {
  if (typeof str !== 'string') return false;

  try {
    console.log("hasJsonStructures" + str)
    const result = JSON.parse(str);
    console.log("DONE")
    const type = Object.prototype.toString.call(result);

    return type === '[object Object]' || type === '[object Array]';
  } catch (err) {
    return false;
  }
}

export function extractProductObject(fullProductId, isCategory) {
  if (!fullProductId) return {};

  let definitionName;
  let connectionName;
  let productId;
  let categoryId;

  if (hasJsonStructure(fullProductId)) {
    console.log("extractProductObject" + fullProductId)
    const propObject = JSON.parse(fullProductId);
    console.log("DONE")
    
    definitionName = propObject.definitionName;
    connectionName = propObject.connectionName;
    categoryId = propObject.categoryId;
    productId = propObject.productId;
  } else {
    if (fullProductId.indexOf('/') > -1) {
      const propArray = fullProductId.split('/');

      definitionName = propArray[0];
      connectionName = propArray[1];

      if (isCategory) {
        categoryId = propArray[2];
      } else {
        productId = propArray[2];
      }
    } else {
      productId = fullProductId;
    }
  }

  return {
    definitionName,
    connectionName,
    productId,
    categoryId,
  };
}

export async function GetProductById(prop, isProductPage) {
  if (!prop) return;

  let definitionName;
  let connectionName;
  let productId;

  if (isProductPage) {
    productId = prop;
    const urlParams = new URLSearchParams(window.location.search);
    definitionName = urlParams.get('definitionName');
    connectionName = urlParams.get('connectionName');

    if (definitionName === 'undefined') definitionName = 'commercetools';
    if (connectionName === 'undefined') connectionName = 'magnolia-services-media-demo';
  } else {
    const productObject = extractProductObject(prop);
    definitionName = productObject.definitionName;
    connectionName = productObject.connectionName;
    productId = productObject.productId;
  }

  let product;

  if (productId.indexOf('~') > -1) {
    product = await CommerceMagnoliaApi.getProductById(productId, definitionName, connectionName);
  } else {
    if (connectionName && connectionName !== 'magnolia-services-media-demo') {
      product = await CommerceMagnoliaApi.getProductById(productId, definitionName, connectionName);
    } else {
      product = await Commercetools.getProductById(productId);
    }
  }

  return product;
}

export async function GetProductsByFilter(prop, filter) {
  let products;
  let definitionName;
  let connectionName;
  let categoryId;

  if (prop) {
    const productObject = extractProductObject(prop, true);

    definitionName = productObject.definitionName;
    connectionName = productObject.connectionName;
    categoryId = productObject.categoryId;

    if (definitionName === 'commercetools') {
      let commercetoolsFilter = '';

      if (categoryId) commercetoolsFilter = '&filter=categories.id:"' + categoryId + '"';
      if (filter) commercetoolsFilter = '&' + filter;

      if (connectionName !== 'magnolia-services-media-demo') {
        products = await CommerceMagnoliaApi.getProductsByFilter(categoryId, definitionName, connectionName);
      } else {
        products = await Commercetools.getProductsByFilter(commercetoolsFilter);
      }
    }

    if (definitionName === 'salesforce-commerce') {
      products = await CommerceMagnoliaApi.getProductsByFilter(categoryId, definitionName, connectionName);
    }

    // case if old handling with custom filter
  } else if (filter) {
    products = await Commercetools.getProductsByFilter('&' + filter);
  }

  products = products.map((product) => ({
    ...product,
    productId: JSON.stringify({
      definitionName,
      connectionName,
      productId: product.id,
    }),
  }));

  return products;
}


export async function GetCategories() {
  const categories = await Commercetools.getCategories();

  return categories;
}

export async function GetCategoryByKey(key) {
  const category = await Commercetools.getCategoryByKey(key);

  return category;
}
