import { useState, useEffect, useCallback, useMemo } from 'react';
import { Line } from '@ant-design/plots';
import { reverse } from 'lodash-es';
import dayjs from 'dayjs';
import { getZTStocksByBiYing, IStockInfo } from '@/services';
import { getRecentWorkdays } from '@/utils';
import './index.less';

export default function HomePage() {
  const [dateStocks, setDateStocks] = useState<
    Array<{
      date: string;
      ztList: IStockInfo[];
      dtList: IStockInfo[];
    }>
  >([]);

  const getData = useCallback(async () => {
    // 获取最近的10个工作日
    const recentWorkdays = getRecentWorkdays(8);
    return Promise.all(
      recentWorkdays.map(async (date) => {
        const data = await getZTStocksByBiYing(date);
        return { date, ztList: data.ztList, dtList: data.dtList };
      }),
    );
  }, []);

  useEffect(() => {
    getData().then((allDateStocks) => {
      setDateStocks(reverse(allDateStocks));
    });
  }, []);

  // 涨跌停 config
  const zdtConfig = useMemo(() => {
    const data: { date: string; value: number; category: string }[] = [];
    dateStocks.forEach((item, index) => {
      const ztValue = item.ztList.length;
      const dtValue = item.dtList.length;
      const preZTValue = dateStocks[index - 1]?.ztList.length;
      const preDTValue = dateStocks[index - 1]?.dtList.length;
      data.push({
        date: dayjs(item.date).format('MM-DD'),
        value: ztValue ? ztValue : preZTValue,
        category: '涨停',
      });
      data.push({
        date: dayjs(item.date).format('MM-DD'),
        value: dtValue ? dtValue : preDTValue,
        category: '跌停',
      });
    });

    const config = {
      data,
      yField: 'value',
      xField: 'date',
      seriesField: 'category',
      color: ['#F4664A', '#5AD8A6'],
      point: {
        size: 4,
        style: {
          lineWidth: 1,
          fillOpacity: 1,
        },
        shape: 'circle',
      },
      // label
      label: {
        layout: [
          {
            type: 'hide-overlap',
          },
        ],
        // 隐藏重叠label
        style: {
          textAlign: 'top',
        },
        formatter: (item: { value: any }) => item.value,
      },
    };
    return config;
  }, [dateStocks]);

  // 连板 config
  const lbConfig = useMemo(() => {
    const data: { date: string; value: number; name: string }[] = [];
    dateStocks.forEach((item, index) => {
      const list = item.ztList.length
        ? item.ztList
        : dateStocks[index - 1]?.ztList;
      list.sort((a, b) => Number(b.lbc) - Number(a.lbc));
      data.push({
        date: dayjs(item.date).format('MM-DD'),
        value: Number(list[0].lbc),
        name: list[0].mc,
      });
    });

    const config = {
      data,
      yField: 'value',
      xField: 'date',
      point: {
        size: 4,
        style: {
          lineWidth: 1,
          fillOpacity: 1,
        },
        shape: 'circle',
      },
      // label
      label: {
        formatter: (item: { value: string; name: string }) =>
          `${item.name}(${item.value})`,
      },
    };
    return config;
  }, [dateStocks]);

  return (
    <div className="index-container">
      <div className="zt-dt">
        <div className="title">涨停板趋势</div>
        <Line {...zdtConfig} />
      </div>
      <div className="max-lbc">
        <div className="title">最高板趋势</div>
        <Line {...lbConfig} />
      </div>
    </div>
  );
}
