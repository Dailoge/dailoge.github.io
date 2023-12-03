import axios from 'axios';
import dayjs from 'dayjs';
import { getStorageDataByDate, setStorageDataByDate } from '../utils';

const request = axios.create({
  baseURL: 'https://service-fxf0odwp-1252010818.sh.apigw.tencentcs.com', // 腾讯云 serverless，底层调用必盈 api，https://ad.biyingapi.com/apidoc.html
  timeout: 5000,
});

export interface IZTDTStockInfo {
  dm: string; //代码
  mc: string; //名称
  p: number; //价格（元）
  zf: number; //跌幅（%）
  cje: number; //成交额（元）
  lt: number; //流通市值（元）
  zsz: number; //总市值（元）
  pe: number; //动态市盈率
  hs: number; //换手率（%）
  lbc: number; //连续涨停/跌停次数
  lbt: string; //最后封板时间（HH:mm:ss）
  zj: number; //封单资金（元）
  fba: number; //板上成交额（元）
  zbc: number; //开板次数
}

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
