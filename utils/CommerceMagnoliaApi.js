import { get } from './magnolia';
import Settings from './Settings';

export default {
  getProductById: async (productId, definitionName, connectionName) => {
    const product = await get(
      '/.rest/ecommerce/v1/products/' + productId + '?definitionName=' + definitionName + '&connectionName=' + connectionName
    );

    if (!product) return;

    return {
      id: product.id?.itemId,
      name: product.name,
      description: product.description,
      price: product.price + ' ' + Settings.getActiveCurrency(),
      images: product.images,
    };
  },

  getProductsByFilter: async (categoryId, definitionName, connectionName) => {
    const products = await get(
      '/.rest/ecommerce/v1/products/category/' + categoryId + '?definitionName=' + definitionName + '&connectionName=' + connectionName
    );

    if (!products) return;

    return products.map((item) => ({
      id: item.id?.itemId,
      name: item.name,
      price: item.price + ' ' + Settings.getActiveCurrency(),
      images: item.images,
    }));
  },
};
