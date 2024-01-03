import axios from 'axios';
import dayjs from 'dayjs';

const request = axios.create({
  baseURL: 'https://service-fxf0odwp-1252010818.sh.apigw.tencentcs.com', // 腾讯云 serverless，底层调用同花顺的 jsonp 能力，https://m.10jqka.com.cn/stockpage/48_883900/?back_source=wxhy&share_hxapp=isc#refCountId=R_56307738_256.html&atab=effectStocks
  timeout: 5000,
});

/**
 * @desc 通过同花顺 h5 接口获取数据
 * @export
 * @param {string} code
 * @param {number} [lineDays=45]
 */
export async function getStockLineInfoByThs(code: string, lineDays = 45) {
  try {
    const requestAdapter = () => request(
      `/getStockLineInfoByThs?code=${code}&lineDays=${lineDays}`,
    );
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
