import { useState, useCallback, useMemo, useEffect } from 'react';
import dayjs from 'dayjs';
import { Line } from '@ant-design/plots';
import { reverse } from 'lodash-es';
import { getStockInfo } from '@/services';

import './index.less';

interface IProps {
  recentWorkdays: string[];
}

export default (props: IProps) => {
  const { recentWorkdays } = props;
  const [marketAmountList, setMarketAmountList] = useState<
    Array<{
      date: string;
      amount: number;
    }>
  >([]);

  const getMarketAmountData = useCallback(async () => {
    return Promise.all(
      recentWorkdays.map(async (date) => {
        const [shData, szData] = await Promise.all([
          getStockInfo('SH000001', date),
          getStockInfo('SZ399001', date),
        ]);
        const amount =
          ((shData?.amount || 0) + (szData?.amount || 0)) / 100000000;
        return {
          date: dayjs(date).format('MM-DD'),
          amount: Math.round(amount),
          shData,
          szData,
        };
      }),
    );
  }, []);

  // 市场总成交额趋势
  const marketAmountConfig = useMemo(() => {
    const marketAmoutAvg =
      marketAmountList.reduce((pre, item) => pre + item.amount, 0) /
      marketAmountList.length;

    const config = {
      data: marketAmountList,
      height: 230,
      yField: 'amount',
      xField: 'date',
      yAxis: {
        min: 5000, // 设置Y轴的最小值
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
        formatter: (item: { amount: number; date: string }) => item.amount,
      },
      // 辅助线
      annotations: [
        {
          type: 'line',
          start: ['min', marketAmoutAvg],
          end: ['max', marketAmoutAvg],
          style: {
            stroke: '#1890ff',
            lineDash: [4, 2],
            lineWidth: 2,
          },
        },
      ],
    };
    return config;
  }, [marketAmountList]);

  useEffect(() => {
    getMarketAmountData().then((marketAmountList) => {
      setMarketAmountList(reverse(marketAmountList));
    });
  }, []);

  return (
    <div className="market-amount">
      <div className="title">市场总成交额趋势</div>
      <Line {...marketAmountConfig} />
    </div>
  );
};
