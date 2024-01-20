import request from './request';
import dayjs from 'dayjs';
import { getStorageDataByDate, setStorageDataByDate } from '../utils';
import { IStockBlockUp, IZTDTStockInfo } from '@/types';

// 底层调用同花顺的 jsonp 能力，https://m.10jqka.com.cn/stockpage/48_883900/?back_source=wxhy&share_hxapp=isc#refCountId=R_56307738_256.html&atab=effectStocks

/**
 * @desc 获取概念风口
 *
 * @export
 * @param {string} date
 * @return {*}  {Promise<IStockBlockUp[]>}
 */
export async function getZTDTStockByDate(date: string): Promise<{
  ztList: IZTDTStockInfo[];
  dtList: IZTDTStockInfo[];
}> {
  const handleDate = dayjs(date).format('YYYYMMDD');
  try {
    const requestAdapter = () =>
      request(`/getZTDTStockByDate?date=${handleDate}`);
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
    const data = res.data.data;
    const handleKeyMap = (list: Array<any>) => {
      return list.map((item) => {
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
          fbt: item.first_limit_down_time, // 第一次封板时间（HH:mm:ss）
          lbt: item.last_limit_down_time, // 最后封板时间（HH:mm:ss）
          zj: item.order_amount, // 封单资金（元）
          kbcs: item.open_num, // 开板次数
        };
      });
    };
    console.log(handleKeyMap(data.ztInfo.info));
    return {
      ztList: handleKeyMap(data.ztInfo.info),
      dtList: handleKeyMap(data.dtInfo.info),
    };
  } catch (error) {
    console.error(error);
    return {
      ztList: [],
      dtList: [],
    };
  }
}

/**
 * @desc 获取概念涨跌幅
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
        date: dayjs(date).format('MM-DD'),
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
 * @desc 获取概念风口
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
    return handleList;
  } catch (error) {
    console.error(error);
    return [];
  }
}
