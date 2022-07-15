import { extractProductObject } from './commerce';
import Settings from './Settings';

const url = {
  getPageLink: (url = '') => {
    const nodeName =
      url.indexOf('_') > -1 ? Settings.getItem('nodeName') : Settings.getItem('nodeName').replace(/_.*/, '');

    return url.replace(new RegExp('(.*' + nodeName + '|.html)', 'g'), '');
  },
  getProductLink: (product) => {
    let { definitionName, connectionName, productId } = extractProductObject(product);

    return '/products/' + productId + '?definitionName=' + definitionName + '&connectionName=' + connectionName;
  },
  getSearchParam(key) {
    return new URLSearchParams(window.location.search).get(key);
  },
  getCanonicalHref(canonical) {
    let href = '#';

    if (!canonical || canonical.field === 'current-page') {
      href = window.location.href;
    } else {
      href = canonical[canonical.field];
    }

    return href;
  },
};

export default url;
