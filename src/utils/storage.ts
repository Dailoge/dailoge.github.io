const STORAGE_STOCK_CACHE = '_STORAGE_STOCK_CACHE_'; // 每天涨跌停的缓存 key
const STORAGE_ZGB_FAIL_CACHE = '_STORAGE_ZGB_FAIL_CACHE_'; // 最高晋级失败的缓存 key

function getStorageData(cacheKey: string,  options: { key: string },) {
  try {
    const dataStr = localStorage.getItem(cacheKey);
    if (dataStr) {
      const data = JSON.parse(dataStr);
      return data[options.key];
    }
    return null;
  } catch (error) {
    console.error('getStorageData', error);
    return null;
  }
}

function setStorageData(
  cacheKey: string,
  options: { key: string; value: any },
) {
  try {
    const dataStr = localStorage.getItem(cacheKey);
    let data = dataStr ? JSON.parse(dataStr) : {};
    data[options.key] = options.value;
    localStorage.setItem(cacheKey, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('setStorageData', error);
    return false;
  }
}

export function getStorageDataByDate(date: string) {
  return getStorageData(STORAGE_STOCK_CACHE, { key: date });
}

export function setStorageDataByDate(date: string, data: any) {
  return setStorageData(STORAGE_STOCK_CACHE, { key: date, value: data });
}

export function getStorageDataByZgbFail(key: string) {
  return getStorageData(STORAGE_ZGB_FAIL_CACHE, { key });
}

export function setStorageDataByZgbFail(key: string, data: any) {
  return setStorageData(STORAGE_ZGB_FAIL_CACHE, { key, value: data });
}
