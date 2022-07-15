import Settings from './Settings';
import { getCurrentLanguage } from './magnolia';

const apiUrl = 'https://api.europe-west1.gcp.commercetools.com/';

class Commercetools {
  constructor() {
    // this.projectKey = 'headless-ecommerce';
    this.projectKey = 'magnolia-integration';
    this.token = undefined;
    this.languageCode = undefined;
    this.currencyCode = undefined;
  }

  async init() {
    const currentLanguage = getCurrentLanguage();

    this.languageCode = ['fr', 'it', 'en_US', 'zh_CN'].indexOf(currentLanguage) > -1 ? 'en' : currentLanguage;
    this.currencyCode = "EUR";//Settings.getActiveCurrency();
    await this.getToken();
  }

  // async getToken() {
  //   const response = await fetch('https://auth.europe-west1.gcp.commercetools.com/oauth/token', {
  //     body: 'grant_type=client_credentials&scope=manage_project:headless-ecommerce',
  //     headers: {
  //       Authorization: 'Basic ZWROUEdRUE5KTEZ6UFFHZm1NUzRHN1BXOkFKOTlISmNtQWRzZE9EdW9XaE1oZHNuQllPb0ljRUpM',
  //       'Content-Type': 'application/x-www-form-urlencoded',
  //     },
  //     method: 'POST',
  //   });
  //   const json = await response.json();

  //   this.token = json.access_token;
  // }

  async getToken() {
    const response = await fetch('https://auth.europe-west1.gcp.commercetools.com/oauth/token', {
      body: 'grant_type=client_credentials&scope=manage_project:magnolia-integration',
      headers: {
        'Authorization': 'Basic ' + btoa('sAoKET4CIRGjVbuEXLtcjDe6:kSE_ko1edNmzS3xH9_DOc-dODXQwCKEx'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
    });
    const json = await response.json();

    this.token = json.access_token;
  }

  async getProductsByFilter(filter) {
    let url = apiUrl + this.projectKey + '/product-projections/search?priceCurrency=' + this.currencyCode + filter;

    const response = await fetch(url, {
      headers: {
        Authorization: 'Bearer ' + this.token,
      },
    });
    const json = await response.json();

    return json.results
      .filter((result) => result.name[this.languageCode] && this.getPrice(result.masterVariant.prices))
      .map((result) => ({
        id: result.id,
        name: result.name[this.languageCode],
        price: this.getPrice(result.masterVariant.prices).normalPrice,
        discountedPrice: this.getPrice(result.masterVariant.prices).discountedPrice,
        images: result.masterVariant.images.map((image) => image.url),
      }));
  }

  async getProductById(id) {
    let url = apiUrl + this.projectKey + '/products/' + id;

    const response = await fetch(url, {
      headers: {
        Authorization: 'Bearer ' + this.token,
      },
    });
    const json = await response.json();

    
    const name = json.masterData.current.name[this.languageCode];
    const prices1 = json.masterData.current.masterVariant.prices;
    const prices = this.getPrice(json.masterData.current.masterVariant.prices);

    if (name && prices.normalPrice) {
      return {
        id,
        name,
        description: json.masterData.current.description[this.languageCode],
        price: prices.normalPrice,
        discountedPrice: prices.discountedPrice,
        images: json.masterData.current.masterVariant.images.map((image) => image.url),
      };
    }
  }

  getPrice(prices) {
    let normalPrice = '';
    let discountedPrice = '';

    const priceInCurrentCurrency = prices.filter((price) => price.value.currencyCode === this.currencyCode);

    if (priceInCurrentCurrency.length > 0) {
      normalPrice = priceInCurrentCurrency[0];

      const centAmount = normalPrice.value.centAmount + '';
      const index = centAmount.length - normalPrice.value.fractionDigits;
      const amount = centAmount.slice(0, index) + ',' + centAmount.slice(index);

      normalPrice = amount + ' ' + normalPrice.value.currencyCode;
    }

    const priceDiscountedInCurrentCurrency = prices.filter(
      (price) => price.discounted?.value.currencyCode === this.currencyCode
    );

    if (priceDiscountedInCurrentCurrency.length > 0) {
      discountedPrice = priceDiscountedInCurrentCurrency[0];

      const centAmount = discountedPrice.discounted.value.centAmount + '';
      const index = centAmount.length - discountedPrice.discounted.value.fractionDigits;
      const amount = centAmount.slice(0, index) + ',' + centAmount.slice(index);

      discountedPrice = amount + ' ' + discountedPrice.value.currencyCode;
    }

    return {
      normalPrice,
      discountedPrice,
    };
  }

  async getCategories() {
    let url = apiUrl + this.projectKey + '/categories?limit=100';

    const response = await fetch(url, {
      headers: {
        Authorization: 'Bearer ' + this.token,
      },
    });
    const json = await response.json();

    const categories = json.results.map((category) => {
      return {
        name: category.name[this.languageCode] || category.name['en'],
        slug: category.slug[this.languageCode] || category.slug['en'],
        id: category.id,
        key: category.key,
        parentId: category.parent?.id || null,
        children: [],
      };
    });

    let categoryMapping = {};
    for (let [i, category] of categories.entries()) {
      categoryMapping[category.id] = i;
    }

    for (let category of categories) {
      if (category.parentId) {
        categories[categoryMapping[category.parentId]].children.push(category);
      }
    }

    return categories;
  }

  async getCategoryByKey(key) {
    let url = apiUrl + this.projectKey + '/categories/key=' + key;

    const response = await fetch(url, {
      headers: {
        Authorization: 'Bearer ' + this.token,
      },
    });
    const category = await response.json();

    return category;
  }
}

export default new Commercetools();
