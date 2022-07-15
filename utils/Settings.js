class Settings {
    setItem(key, value) {
      this[key] = value;
    }
  
    getItem(key) {
      return this[key];
    }
  
    getActiveCurrency() {
      const currencies = this.currencies.split(' ');
      let activeCurrency = currencies[0];
      const storedCurrency = localStorage.getItem('currencyCode');
  
      if (storedCurrency) activeCurrency = storedCurrency;
  
      return activeCurrency;
    }
  
    setActiveCurrency(currencyCode) {
      localStorage.setItem('currencyCode', currencyCode);
      window.location.reload();
    }
  }
  
  export default new Settings();
  