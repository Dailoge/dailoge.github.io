import dayjs from 'dayjs';
import request from './request';
import { getStorageZTDTDataByDate, setStorageZTDTDataByDate } from '../utils';
import { IZTDTStockInfo } from '@/types';

// 底层调用必盈 api，https://ad.biyingapi.com/apidoc.html
/**
 * @desc 获取涨跌停个数，但是有 10 分钟的延迟
 * @export
 * @param {string} date, ex: 2023-11-24
 * @return {*}  {Promise<IZTDTStockInfo[]>}
 */
export async function getZTDTStocksByBiYing(date: string): Promise<{
  ztList: IZTDTStockInfo[];
  dtList: IZTDTStockInfo[];
}> {
  try {
    const requestAdapter = () => request(`/release/zt-dt?date=${date}`);
    let result;
    const storageData = getStorageZTDTDataByDate(date);
    const isToday = dayjs().format('YYYY-MM-DD') === date;
    // 如果是当天不能走缓存也不能设置缓存
    if (storageData && !isToday) {
      result = storageData;
    } else {
      // 因为是 serverless，服务重启要时间，这里支持二次重试
      const response = await requestAdapter().catch(requestAdapter);
      result = response.data;
      if (!isToday) {
        setStorageZTDTDataByDate(date, response.data);
      }
    }
    return result?.data;
  } catch (error) {
    console.error(error);
    return {
      ztList: [],
      dtList: [],
    };
  }
}
