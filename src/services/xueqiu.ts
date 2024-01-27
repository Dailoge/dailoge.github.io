import request from './request';
import dayjs from 'dayjs';
import { getStorageInfoByDate, setStorageInfoByDate } from '../utils';

// 底层调用雪球服务，https://xueqiu.com/S/SH600839
/**
 * @desc 获取股价具体信息
 * @export
 * @param {string} code, 必须带上是 SH 还是 SZ
 * @param {string} date
 * @return {*}
 */
export async function getStockInfo(code: string, date: string) {
  try {
    let result;
    const storageData = getStorageInfoByDate(code + '_' + date);
    const isToday = dayjs().format('YYYY-MM-DD') === date;
    if (storageData) {
      result = storageData;
    } else {
      let prefix = '';
      if (code.startsWith('00') || code.startsWith('300')) {
        prefix = 'SZ';
      } else if (code.startsWith('60') || code.startsWith('688')) {
        prefix = 'SH';
      }
      const response = await request(
        `/getStockInfo?code=${prefix + code}&timestamp=${dayjs(
          date,
        ).valueOf()}`,
      );
      result = response.data
      if (!isToday) {
        setStorageInfoByDate(code + '_' + date, response.data);
      }
    }
    const data = result?.data?.data;
    if (!data || !data.column) return null;
    const percentIndex = data.column.findIndex(
      (key: string) => key === 'percent',
    );
    const openIndex = data.column.findIndex((key: string) => key === 'open');
    const closeIndex = data.column.findIndex((key: string) => key === 'close');
    const highIndex = data.column.findIndex((key: string) => key === 'high');
    const lowIndex = data.column.findIndex((key: string) => key === 'low');
    const amountIndex = data.column.findIndex(
      (key: string) => key === 'amount',
    );
    const percent: number = data.item[0][percentIndex];
    const open: number = data.item[0][openIndex];
    const close: number = data.item[0][closeIndex];
    const high: number = data.item[0][highIndex];
    const low: number = data.item[0][lowIndex];
    const amount: number = data.item[0][amountIndex];
    const yesterdayClose = close / (1 + percent * 0.01);
    const amplitude = (high - low) / yesterdayClose; // 振幅
    const openRadio = (open - yesterdayClose) / yesterdayClose;
    return {
      percent,
      openRadio: (openRadio * 100).toFixed(2),
      amplitude: (amplitude * 100).toFixed(2),
      amount,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}
