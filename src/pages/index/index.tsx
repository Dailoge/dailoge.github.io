import { useState, useEffect, useCallback, useMemo } from 'react';
import { Line, Column } from '@ant-design/plots';
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
    // 获取最近的8个工作日
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
    dateStocks.forEach((item) => {
      const ztValue = item.ztList.length;
      const dtValue = item.dtList.length;
      data.push({
        date: dayjs(item.date).format('MM-DD'),
        value: ztValue,
        category: '涨停',
      });
      data.push({
        date: dayjs(item.date).format('MM-DD'),
        value: dtValue,
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
    const data: { date: string; value: number; category: string }[] = [];
    dateStocks.forEach((item, index) => {
      const list = item.ztList.length
        ? item.ztList
        : dateStocks[index - 1]?.ztList;
      const lb2b = list.filter((item) => Number(item.lbc) === 2).length;
      const lb3b = list.filter((item) => Number(item.lbc) === 3).length;
      const lb4b = list.filter((item) => Number(item.lbc) === 4).length;
      const lb5b = list.filter((item) => Number(item.lbc) === 5).length;
      const lb6bAndUp = list.filter((item) => Number(item.lbc) >= 6).length;
      data.push({
        date: dayjs(item.date).format('MM-DD'),
        value: lb2b,
        category: '2板',
      });
      data.push({
        date: dayjs(item.date).format('MM-DD'),
        value: lb3b,
        category: '3板',
      });
      data.push({
        date: dayjs(item.date).format('MM-DD'),
        value: lb4b,
        category: '4板',
      });
      data.push({
        date: dayjs(item.date).format('MM-DD'),
        value: lb5b,
        category: '5板',
      });
      data.push({
        date: dayjs(item.date).format('MM-DD'),
        value: lb6bAndUp,
        category: '6板+',
      });
    });

    const config = {
      data,
      isStack: true,
      yField: 'value',
      xField: 'date',
      seriesField: 'category',
      // label
      label: {
        formatter: (item: { value: string; name: string }) => Number(item.value) !== 0 ? item.value : '',
      },
      legend: {
        layout: 'vertical',
        position: 'top'
      }
    };
    return config;
  }, [dateStocks]);

  // 最高板 config
  const zgbConfig = useMemo(() => {
    const data: {
      date: string;
      value: number;
      name: string;
      lbName: string;
    }[] = [];
    dateStocks.forEach((item, index) => {
      const list = item.ztList.length
        ? item.ztList
        : dateStocks[index - 1]?.ztList;
      list.sort((a, b) => Number(b.lbc) - Number(a.lbc));
      // 最高板同时可能有多个
      const lbName = list
        .filter((item) => item.lbc === list[0].lbc)
        .map((item) => item.mc)
        .join();
      data.push({
        date: dayjs(item.date).format('MM-DD'),
        value: Number(list[0].lbc),
        name: lbName.length > 7 ? lbName.substring(0, 8) + '...' : lbName,
        lbName,
      });
    });

    const config = {
      data,
      yField: 'value',
      xField: 'date',
      tooltip: {
        title: 'lbName',
      },
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
        <div className="title">涨跌停趋势</div>
        <Line {...zdtConfig} />
      </div>
      <div className="zgb">
        <div className="title">最高板趋势</div>
        <Line {...zgbConfig} />
      </div>
      <div className="lb">
        <div className="title">连板趋势</div>
        <Column {...lbConfig} />
      </div>
    </div>
  );
}
