import { useState, useMemo, useEffect } from 'react';
import { Line } from '@ant-design/plots';
import { getStockLineInfoByThs } from '@/services';

import './index.less';

interface IProps {
  recentWorkCountDays: number;
}

export default (props: IProps) => {
  const { recentWorkCountDays } = props;
  const [lbjj, setLbjj] = useState<
    Array<{
      date: string;
      open: number;
      close: number;
      percent: number;
    }>
  >([]);

  // 市场总成交额趋势
  const marketAmountConfig = useMemo(() => {
    const marketAmoutAvg =
    lbjj.reduce((pre, item) => pre + item.percent, 0) /
    lbjj.length;

    const config = {
      data: lbjj,
      height: 230,
      yField: 'percent',
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
        formatter: (item: { percent: number; date: string }) => item.percent,
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
  }, [lbjj]);

  useEffect(() => {
    getStockLineInfoByThs('883958', recentWorkCountDays).then(setLbjj);
  }, []);

  return (
    <div className="market-amount">
      <div className="title">连板赚钱效应趋势</div>
      <Line {...marketAmountConfig} />
    </div>
  );
};
