// 同花顺的jsonp 请求
import dayjs from 'dayjs';

interface IStockLineInfo {
  data: string;
}

const global: any = window;
/**
 * @desc 通过同花顺 h5 接口获取数据
 * @export
 * @param {string} code
 * @param {number} [lineDays=45]
 */
export async function getStockLineInfoByThs(code: string, lineDays = 45) {
  return new Promise((resolve) => {
    const callbackName = `quotebridge_v6_line_48_${code}_01_last${lineDays}`;
    global[callbackName] = (res: IStockLineInfo) => {
      const list = res.data.split(';');
      const handleList = list.map((item, index) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [date, open, maxValue, minValue, close] = item.split(',');
        const yesterdayClose =
          index === 0 ? open : list[index - 1].split(',')[4];
        const percent =
          Math.round(
            ((Number(close) - Number(yesterdayClose)) /
              Number(yesterdayClose)) *
              10000,
          ) / 100;
        return {
          date: dayjs(date).format('MM-DD'),
          open,
          close,
          percent,
        };
      });
      resolve(handleList);
    };
    const script = document.createElement('script');
    script.src = `https://d.10jqka.com.cn/v6/line/48_${code}/01/last${lineDays}.js`;
    document.body.appendChild(script);
  });
}
