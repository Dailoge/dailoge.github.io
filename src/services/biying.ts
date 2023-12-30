import axios from 'axios';
import dayjs from 'dayjs';
import { getStorageDataByDate, setStorageDataByDate } from '../utils';
import { IZTDTStockInfo } from '@/types';

const request = axios.create({
  baseURL: 'https://service-fxf0odwp-1252010818.sh.apigw.tencentcs.com', // 腾讯云 serverless，底层调用必盈 api，https://ad.biyingapi.com/apidoc.html
  timeout: 5000,
});

/**
 *
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
    let res;
    const storageData = getStorageDataByDate(date);
    const isToday = dayjs().format('YYYY-MM-DD') === date;
    // 如果是当天不能走缓存也不能设置缓存
    if (storageData && !isToday) {
      res = storageData;
    } else {
      // 因为是 serverless，服务重启要时间，这里支持二次重试
      res = await requestAdapter().catch(requestAdapter);
      if (!isToday) {
        setStorageDataByDate(date, res);
      }
    }
    return res?.data?.data;
  } catch (error) {
    console.error(error);
    return {
      ztList: [],
      dtList: [],
    };
  }
}
