import { useState, useMemo, useEffect, useCallback } from 'react';
import { Line } from '@ant-design/plots';
import { Button } from 'antd-mobile';
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

  // 连板赚钱效应趋势
  const llMakeMoneyConfig = useMemo(() => {
    const llMakeMoneyAvg =
      lbjj.reduce((pre, item) => pre + item.percent, 0) / lbjj.length;

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
          start: ['min', llMakeMoneyAvg],
          end: ['max', llMakeMoneyAvg],
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

  const queryLbMakeMoneyInfo = useCallback(() => {
    getStockLineInfoByThs('883958', recentWorkCountDays).then(setLbjj);
  }, [recentWorkCountDays]);

  useEffect(() => {
    queryLbMakeMoneyInfo();
  }, []);

  return (
    <div className="ll-make-money">
      <div className="title">
        <span>连板赚钱效应趋势</span>
        <Button className='reload-btn' size="small" color="primary" onClick={queryLbMakeMoneyInfo}>
          刷新
        </Button>
      </div>
      <Line {...llMakeMoneyConfig} />
    </div>
  );
};
