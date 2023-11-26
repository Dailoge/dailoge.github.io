import { useState, useEffect, useCallback, useMemo } from 'react';
import { Line } from '@ant-design/charts';
import { reverse } from 'lodash-es';
import dayjs from 'dayjs';
import { getZTStocksByBiYing, IStockInfo } from '@/services';
import { getRecentWorkdays } from '@/utils';
import './index.less';

export default function HomePage() {
  const [dateZDStocks, setDateZDStocks] = useState<
    Array<{
      date: string;
      list: IStockInfo[];
    }>
  >([]);

  const getData = useCallback(async () => {
    // 获取最近的10个工作日
    const recentWorkdays = getRecentWorkdays(8);
    return Promise.all(
      recentWorkdays.map(async (date) => {
        const list = await getZTStocksByBiYing(date);
        return { date, list };
      }),
    );
  }, []);

  useEffect(() => {
    getData().then((allDateStocks) => {
      setDateZDStocks(reverse(allDateStocks));
    });
  }, []);

  const config = useMemo(() => {
    const data = dateZDStocks.map((item, index) => {
      const value = item.list.length;
      const preValue = dateZDStocks[index - 1]?.list.length;
      return {
        date: dayjs(item.date).format('MM-DD'),
        value: value ? value : preValue,
      }
    });
  
    const config = {
      data,
      yField: 'value',
      xField: 'date',
      point: {
        size: 5,
        shape: 'diamond',
        style: {
          fill: 'white',
          stroke: '#2593fc',
          lineWidth: 2,
        },
      },
    };
    return config;
  }, [dateZDStocks]);

  

  return (
    <div className="index-container">
      <Line {...config} />
    </div>
  );
}
