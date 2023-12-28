import axios from 'axios';
import dayjs from 'dayjs';
import { getStorageDataByZgbFail, setStorageDataByZgbFail } from '../utils';

const request = axios.create({
  baseURL: 'https://service-fxf0odwp-1252010818.sh.apigw.tencentcs.com', // 腾讯云 serverless，底层调用雪球服务，https://xueqiu.com/S/SH600839
  timeout: 5000,
});

export async function getStockInfo(code: string, date: string) {
  try {
    let res;
    const storageData = getStorageDataByZgbFail(code + '_' + date);
    const isToday = dayjs().format('YYYY-MM-DD') === date;
    if (storageData) {
      res = storageData;
    } else {
      res = await request(
        `/getStockInfo?code=${code.toUpperCase()}&timestamp=${dayjs(
          date,
        ).valueOf()}`,
      );
      if (!isToday) {
        setStorageDataByZgbFail(code + '_' + date, res);
      }
    }
    const data = res?.data?.data?.data;
    if (!data) return null;
    const percentIndex = data.column.findIndex(
      (key: string) => key === 'percent',
    );
    const openIndex = data.column.findIndex((key: string) => key === 'open');
    const closeIndex = data.column.findIndex((key: string) => key === 'close');
    const highIndex = data.column.findIndex((key: string) => key === 'high');
    const lowIndex = data.column.findIndex((key: string) => key === 'low');
    const amountIndex = data.column.findIndex((key: string) => key === 'amount');
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
