const STORAGE_STOCK_CACHE = '_STORAGE_STOCK_CACHE_';

export function getStorageDataByDate(date: string) {
  try {
    const stockDataStr = localStorage.getItem(STORAGE_STOCK_CACHE);
    if (stockDataStr) {
      const stockData = JSON.parse(stockDataStr);
      return stockData[date];
    }
    return null;
  } catch (error) {
    console.error('getStorageDataByDate', error);
    return null;
  }
}

export function setStorageDataByDate(date: string, data: any) {
  try {
    const stockDataStr = localStorage.getItem(STORAGE_STOCK_CACHE);
    let stockData = stockDataStr ? JSON.parse(stockDataStr) : {};
    stockData[date] = data;
    localStorage.setItem(STORAGE_STOCK_CACHE, JSON.stringify(stockData));
    return true;
  } catch (error) {
    console.error('setStorageDataByDate', error);
    return false;
  }
}
