import dayjs from 'dayjs';

const STORAGE_STOCK_CACHE = '_STORAGE_STOCK_ZTDT_CACHE_THS_NEW_'; // 每天涨跌停的缓存 key
const STORAGE_STOCK_INFO_CACHE = '_STORAGE_STOCK_INFO_CACHE_V1'; // 个股信息的缓存 key

function getStorageData(cacheKey: string, options: { key: string }) {
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

export function getStorageZTDTDataByDate(date: string) {
  return getStorageData(STORAGE_STOCK_CACHE, { key: date });
}

export function setStorageZTDTDataByDate(date: string, data: any) {
  return setStorageData(STORAGE_STOCK_CACHE, { key: date, value: data });
}

export function getStorageInfoByDate(key: string) {
  return getStorageData(STORAGE_STOCK_INFO_CACHE, { key });
}

export function setStorageInfoByDate(key: string, data: any) {
  return setStorageData(STORAGE_STOCK_INFO_CACHE, { key, value: data });
}

export function optimizeStorage({ minDay }: { minDay: string }) {
  const currCacheKeys = [STORAGE_STOCK_CACHE, STORAGE_STOCK_INFO_CACHE];
  for (let i = 0; i < localStorage.length; i++) {
    const cacheKey = localStorage.key(i) as string;
    if (!currCacheKeys.includes(cacheKey)) {
      localStorage.removeItem(cacheKey);
    } else {
      const dataStr = localStorage.getItem(cacheKey);
      if (dataStr) {
        const data = JSON.parse(dataStr);
        const dateReg = /\d*-\d*-\d*/;
        Object.keys(data).forEach((key) => {
          const regRes = dateReg.exec(key);
          if (regRes) {
            // 更早的时间删除
            if (dayjs(regRes[0]).isBefore(dayjs(minDay))) {
              console.log(`删除缓存 ${cacheKey}.${key}`);
              delete data[key];
            }
          }
        });
        localStorage.setItem(cacheKey, JSON.stringify(data));
      }
    }
  }
}
