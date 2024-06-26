import request from './request';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash-es';
import {
  getStorageZTDTDataByDate,
  setStorageZTDTDataByDate,
  getStorageLbDataByDate,
  setStorageLbDataByDate,
  getStorageBlockUpByDate,
  setStorageBlockUpByDate,
} from '../utils';
import {
  IStockBlockUp,
  ILbStock,
  IZTDTStockInfo,
  IHotStock,
  IHotPlate,
} from '@/types';

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
 * @desc 获取概念当天涨跌幅，如连板概念
 * @export
 * @param {string} code
 * @param {string} type: 48 是 88 开头板块指数，hs 是 512、399 开头指数
 */
export async function getStockTodayInfoByThs(code: string, type: string) {
  try {
    const requestAdapter = () =>
      request(`/getStockTodayInfoByThs?code=${code}&type=${type}`);
    const res = await requestAdapter().catch(requestAdapter);
    const todayInfo = res.data.data;
    return {
      date: todayInfo['1'],
      open: todayInfo['7'],
      close: todayInfo['11'],
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 * @desc 获取概念涨跌幅，如连板概念
 * @export
 * @param {string} code
 * @param {number} [lineDays=45]
 */
export async function getStockLineInfoByThs(
  code: string,
  lineDays = 45,
): Promise<
  Array<{
    date: string;
    open: number;
    close: number;
    percent: number;
  }>
> {
  try {
    let type = '48'; // type: 48 是 88 开头板块指数，hs 是 512、399 开头指数
    if (code.startsWith('512') || code.startsWith('399')) {
      type = 'hs';
    }
    const requestAdapter = () =>
      request(
        `/getStockLineInfoByThs?code=${code}&lineDays=${lineDays}&type=${type}`,
      );
    const [res, todayInfo] = await Promise.all([
      requestAdapter().catch(requestAdapter),
      getStockTodayInfoByThs(code, type),
    ]);
    const list = res.data.data.data.split(';');
    const handleList = list.map((item: string, index: number) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      let [date, open, maxValue, minValue, close] = item.split(',');
      if (date === todayInfo?.date) {
        open = todayInfo.open;
        close = todayInfo.close;
      }
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
  noUseStorage: boolean,
): Promise<IStockBlockUp[]> {
  const handleDate = dayjs(date).format('YYYYMMDD');
  try {
    const requestAdapter = () =>
      request(`/getStockBlockUpByDate?date=${handleDate}`);
    let result;
    const storageData = getStorageBlockUpByDate(date);
    const isToday = dayjs().format('YYYY-MM-DD') === date;
    // 如果是当天不能走缓存也不能设置缓存
    if (storageData && !isToday && !noUseStorage) {
      result = storageData;
    } else {
      const response = await requestAdapter().catch(requestAdapter);
      result = cloneDeep(response.data);
      if (!isToday) {
        response.data.data.data.forEach((item: IStockBlockUp) => {
          item.stock_list = [];
        });
        setStorageBlockUpByDate(date, response.data);
      }
    }
    const handleList: IStockBlockUp[] = result.data.data;
    handleList.sort((a, b) => b.change - a.change);
    return handleList;
  } catch (error) {
    console.error(error);
    return [];
  }
}

/**
 * @desc 获取实时个股热度榜
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

/**
 * @desc 获取实时板块热度榜
 *
 * @export
 * @param {string} date
 * @return {*}  {Promise<IHotStock[]>}
 */
export async function getHotPlateTop(): Promise<{
  conceptList: IHotPlate[];
  industryList: IHotPlate[];
}> {
  try {
    const requestConceptAdapter = () => request(`/getHotPlateTop?type=concept`);
    const requestIndustryAdapter = () =>
      request(`/getHotPlateTop?type=industry`);
    const [conceptList, industryList] = await Promise.all([
      requestConceptAdapter().catch(requestConceptAdapter),
      requestIndustryAdapter().catch(requestIndustryAdapter),
    ]).then(([conceptRes, industryRes]) => {
      return [
        conceptRes.data.data.plate_list,
        industryRes.data.data.plate_list,
      ];
    });
    return {
      conceptList,
      industryList,
    };
  } catch (error) {
    console.error(error);
    return {
      conceptList: [],
      industryList: [],
    };
  }
}
