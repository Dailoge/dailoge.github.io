import { useState, useMemo, useEffect, useCallback } from 'react';
import { Line } from '@ant-design/plots';
import { Button, Toast } from 'antd-mobile';
import { CloseCircleOutline } from 'antd-mobile-icons';
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
  const lbMakeMoneyConfig = useMemo(() => {
    // const llMakeMoneyAvg =
    //   lbjj.reduce((pre, item) => pre + item.percent, 0) / lbjj.length;

    const config = {
      data: lbjj,
      height: 150,
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
          start: ['min', 6],
          end: ['max', 6],
          style: {
            stroke: '#f13611',
            lineDash: [4, 2],
            lineWidth: 2,
          },
        },
      ],
    };
    return config;
  }, [lbjj]);

  const queryLbMakeMoneyInfo = useCallback(async () => {
    const lbjjData = await getStockLineInfoByThs('883958', recentWorkCountDays);
    setLbjj(lbjjData);
  }, [recentWorkCountDays]);

  useEffect(() => {
    if (lbjj.length) {
      if (lbjj[lbjj.length - 1].percent >= 6) {
        Toast.show({
          content: '短线情绪高潮，及时清仓~',
          icon: <CloseCircleOutline />,
        });
      }
    }
  }, [lbjj]);

  useEffect(() => {
    queryLbMakeMoneyInfo();
  }, []);

  return (
    <div className="lb-make-money">
      <div className="title">
        <span>连板赚钱效应趋势</span>
        <Button
          className="reload-btn"
          size="small"
          color="primary"
          onClick={queryLbMakeMoneyInfo}
        >
          刷新
        </Button>
      </div>
      <Line {...lbMakeMoneyConfig} />
    </div>
  );
};
