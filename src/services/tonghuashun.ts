import request from './request';
import dayjs from 'dayjs';
import {
  getStorageZTDTDataByDate,
  setStorageZTDTDataByDate,
  getStorageLbDataByDate,
  setStorageLbDataByDate,
} from '../utils';
import { IStockBlockUp, ILbStock, IZTDTStockInfo, IHotStock } from '@/types';

// 底层调用同花顺的 jsonp 能力，https://m.10jqka.com.cn/stockpage/48_883900/?back_source=wxhy&share_hxapp=isc#refCountId=R_56307738_256.html&atab=effectStocks

/**
 * @desc 获取指定日期的涨跌个股
 *
 * @export
 * @param {string} date
 * @return {*}  {Promise<IStockBlockUp[]>}
 */
export async function getZTDTStockByDate(date: string): Promise<{
  ztList: IZTDTStockInfo[];
  ztTotal: number;
  dtList: IZTDTStockInfo[];
  dtTotal: number;
}> {
  const handleDate = dayjs(date).format('YYYYMMDD');
  try {
    const requestAdapter = () =>
      request(`/getZTDTStockByDate?date=${handleDate}`);
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
    const handleKeyMap = (list: Array<any>, type: 'zt' | 'dt') => {
      return list.map((item) => {
        const isZt = type === 'zt';
        const lbcReg = /(.*)天(.*)板/;
        const regRes = lbcReg.exec(item.high_days); // 9天9板、9天5板
        let lbc = 1;
        if (regRes && regRes[1] === regRes[2]) {
          lbc = Number(regRes[1]);
        }
        return {
          code: item.code,
          name: item.name,
          price: item.latest, // 价格（元）
          zdf: item.change_rate, // 涨跌幅（%）
          cje: item.turnover, // 成交额（元）
          ltsz: item.currency_value, // 流通市值（元）
          hs: item.turnover_rate, // 换手率（%）
          lbc, // 连续涨停次数
          fbt: isZt ? item.first_limit_up_time : item.first_limit_down_time, // 第一次封板时间（HH:mm:ss）
          lbt: isZt ? item.last_limit_up_time : item.last_limit_down_time, // 最后封板时间（HH:mm:ss）
          fde: item.order_amount, // 封单资金（元）
          kbcs: item.open_num, // 开板次数
          type: item.limit_up_type, // 涨停类型
        };
      });
    };
    return {
      ztList: handleKeyMap(result.data.ztInfo.info, 'zt'),
      ztTotal: result.data.ztInfo.page.total,
      dtList: handleKeyMap(result.data.dtInfo.info, 'dt'),
      dtTotal: result.data.dtInfo.page.total,
    };
  } catch (error) {
    console.error(error);
    return {
      ztList: [],
      ztTotal: 0,
      dtList: [],
      dtTotal: 0,
    };
  }
}

/**
 * @desc 获取指定日期的连板个股
 *
 * @export
 * @param {string} date
 * @return {*}  {Promise<ILbStock[]>}
 */
export async function getLbStockByDate(date: string): Promise<ILbStock[]> {
  const handleDate = dayjs(date).format('YYYYMMDD');
  try {
    const requestAdapter = () =>
      request(`/getLbStockByDate?date=${handleDate}`);
    let result;
    const storageData = getStorageLbDataByDate(date);
    const isToday = dayjs().format('YYYY-MM-DD') === date;
    // 如果是当天不能走缓存也不能设置缓存
    if (storageData && !isToday) {
      result = storageData;
    } else {
      const response = await requestAdapter().catch(requestAdapter);
      result = response.data;
      if (!isToday) {
        setStorageLbDataByDate(date, response.data);
      }
    }
    const handleList = result.data;
    return handleList;
  } catch (error) {
    console.error(error);
    return [];
  }
}

/**
 * @desc 获取概念涨跌幅，如连板概念
 * @export
 * @param {string} code
 * @param {number} [lineDays=45]
 */
export async function getStockLineInfoByThs(code: string, lineDays = 45) {
  try {
    const requestAdapter = () =>
      request(`/getStockLineInfoByThs?code=${code}&lineDays=${lineDays}`);
    const res = await requestAdapter().catch(requestAdapter);
    const list = res.data.data.data.split(';');
    const handleList = list.map((item: string, index: number) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [date, open, maxValue, minValue, close] = item.split(',');
      const yesterdayClose = index === 0 ? open : list[index - 1].split(',')[4];
      const percent =
        Math.round(
          ((Number(close) - Number(yesterdayClose)) / Number(yesterdayClose)) *
            10000,
        ) / 100;
      return {
        date: dayjs(date).format('MMDD'),
        open,
        close,
        percent,
      };
    });
    return handleList;
  } catch (error) {
    console.error(error);
    return [];
  }
}

/**
 * @desc 获取指定日期的概念风口
 *
 * @export
 * @param {string} date
 * @return {*}  {Promise<IStockBlockUp[]>}
 */
export async function getStockBlockUpByDate(
  date: string,
): Promise<IStockBlockUp[]> {
  const handleDate = dayjs(date).format('YYYYMMDD');
  try {
    const requestAdapter = () =>
      request(`/getStockBlockUpByDate?date=${handleDate}`);
    const res = await requestAdapter().catch(requestAdapter);
    const handleList = res.data.data.data;
    return handleList || [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

/**
 * @desc 获取实时热度榜
 *
 * @export
 * @param {string} date
 * @return {*}  {Promise<IHotStock[]>}
 */
export async function getHotStockTop(): Promise<IHotStock[]> {
  try {
    const requestAdapter = () => request(`/getHotStockTop`);
    const res = await requestAdapter().catch(requestAdapter);
    const handleList = res.data.data.stock_list;
    return handleList;
  } catch (error) {
    console.error(error);
    return [];
  }
}
