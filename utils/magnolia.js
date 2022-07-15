import Settings from './Settings';

export function getImageUrl(image) {
  const baseUrl = Settings.getItem('baseUrl');
  let imageLink = '#';
  if (!image) return imageLink;
  if (image['@link']) {
    if (image['@link'].indexOf('http') > -1) {
      return image['@link'];
    } else {
      imageLink = baseUrl + image['@link'];
    }
  } else {
    imageLink = baseUrl + '/dam/' + image;
  }

  return imageLink;
}

export async function get(url, data) {
  const baseUrl = Settings.getItem('baseUrl');
  let fullUrl = url;
  const languageCode = getCurrentLanguage();

  if (languageCode) {
    if (url.indexOf('?') < 0) {
      fullUrl += '?';
    } else {
      fullUrl += '&';
    }

    fullUrl += 'lang=' + languageCode.replace('_', '-');
  }

  const response = await fetch(baseUrl + fullUrl, data);
  const json = await response.json();

  if (json.error) return false;

  return json;
}

export function getLanguages() {

//     Settings.setItem('languages', ['en', 'de'])
//   return Settings.getItem('languages');
  return ['en', 'de']
}

export function getCurrentLanguage() {
  //const languages = Settings.getItem('languages');
const languages = ['en', 'de'];

  for (let i = 0; i < languages.length; i++) {
    const language = languages[i];

    if (new RegExp('/' + language + '($|/)').test(window.location.pathname)) {
      return language;
    }
  }

  return languages[0];
}

function removeCurrentLanguage(string, currentLanguage) {
  return string.replace(new RegExp('/' + currentLanguage + '($|/)'), '/');
}

export function changeLanguage(newLanguage) {
  const nodeName = Settings.getItem('nodeName');
  const languages = Settings.getItem('languages');
  let pathname = window.location.pathname;
  const currentLanguage = getCurrentLanguage();

  pathname = removeCurrentLanguage(pathname, currentLanguage);

  if (languages[0] !== newLanguage) {
    if (pathname.indexOf(nodeName) > -1) {
      pathname = pathname.replace(new RegExp(nodeName), '/' + newLanguage + nodeName);
    } else {
      pathname = '/' + newLanguage + pathname;
    }
  }

  window.location.href = window.location.origin + pathname + window.location.search;
}

export function getRouterBasename() {
  const nodeName = Settings.getItem('nodeName');
  const languages = Settings.getItem('languages');
  const pathname = window.location.pathname;
  const apps = ['inspirations-app'];

  if (apps) {
    apps.forEach(function (app) {
      if (pathname.indexOf(app) > -1) {
        return pathname.replace(new RegExp(app + '.*'), '') + app;
      }
    });
  }

  if (pathname.indexOf(nodeName) > -1) {
    return pathname.replace(new RegExp(nodeName + '.*'), '') + nodeName;
  }

  const currentLanguage = getCurrentLanguage();

  return languages[0] === currentLanguage ? '/' : '/' + currentLanguage;
}

function setURLSearchParams(url, param) {
  return url + (url.indexOf('?') > -1 ? '&' : '?') + param;
}

export async function getPage() {
  const nodeName = Settings.getItem('nodeName');
  const languages = Settings.getItem('languages');
  let params = window.location.search;
  const urlParams = new URLSearchParams(params);
  const mgnlPreview = urlParams.get('mgnlPreview');
  const mgnlVersion = urlParams.get('mgnlVersion');
  const pathname = window.location.pathname;
  const currentLanguage = getCurrentLanguage();
  let url = '/.rest/delivery/pages';
  let templateAnnotationsWorkspace = '/website';
  let pagePath;
  let templateAnnotations = {};

  if (mgnlVersion) {
    url = '/.rest/preview/pages';
    params = setURLSearchParams(params, 'version=' + mgnlVersion);
    pagePath = nodeName + pathname.replace(new RegExp('(.*' + nodeName + '|.html)', 'g'), '');

  } else if (pathname.includes('/campaign/')) {
    url = '/.rest/campaign-manager';
    templateAnnotationsWorkspace = '/campaign-manager';
    pagePath = pathname.replace(new RegExp('(.*/campaign|.html)', 'g'), '');

  } else if (pathname.includes('/mobile-page/')) {
    url = '/.rest/mobile-pages';
    templateAnnotationsWorkspace = '/mobile-pages';
    pagePath = pathname.replace(new RegExp('(.*/mobile-page|.html)', 'g'), '');

  } else if (pathname.includes('/customer-journey/')) {
    url = '/.rest/customer-journey';
    templateAnnotationsWorkspace = '/customer-journeys';
    pagePath = pathname.replace(new RegExp('(.*/customer-journey|.html)', 'g'), '');

  } else {
    pagePath = nodeName + pathname.replace(new RegExp('(.*' + nodeName + '|.html)', 'g'), '');
  }

  if (currentLanguage !== languages[0]) {
    pagePath = removeCurrentLanguage(pagePath, currentLanguage);
  }

  // Fetch /products page for /products/.*
  if (/\/products\/.+/.test(pagePath)) {
    pagePath = pagePath.split('/products/')[0] + '/products';
  }

  // p13n
  if (mgnlPreview) {
    params = setURLSearchParams(params, 'variants=all');
  }

  const content = await get(url + pagePath + params);

  if (mgnlPreview && !mgnlVersion) {
    templateAnnotations = await get('/.rest/template-annotations/v1' + templateAnnotationsWorkspace + pagePath);
  }

  window.scoreModel.getPageVisitMetaTags(content.scoreModels);

  return {
    templateAnnotations,
    content,
  };
}
