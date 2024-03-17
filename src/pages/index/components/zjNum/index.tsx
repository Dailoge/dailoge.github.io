import { useMemo } from 'react';
import dayjs from 'dayjs';
import { Line } from '@ant-design/plots';
import { IDateStock } from '@/types';

import './index.less';

interface IProps {
  dateStocks: IDateStock[];
}

export default (props: IProps) => {
  const { dateStocks } = props;

  const zhongjunConfig = useMemo(() => {
    const data: {
      date: string;
      value: number;
      dtName: string;
    }[] = [];
    dateStocks.forEach((item) => {
      const ztList = item.ztList;
      const zhongjunList = ztList.filter((item) => {
        return (item?.cje as number) >= 2500000000; // 大于 25 亿
      });
      data.push({
        date: dayjs(item.date).format('MMDD'),
        value: zhongjunList.length,
        dtName: zhongjunList
          .map((i) => {
            return i.name;
          })
          .join(),
      });
    });

    const config = {
      data,
      height: 130,
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
      // 悬浮展示内容
      tooltip: {
        title: 'dtName',
        formatter: (datum: { value: number; date: string }) => {
          return { name: datum.value, value: datum.date };
        },
      },
      // label
      label: {
        formatter: (item: { value: number; date: string }) => item.value,
      },
    };
    return config;
  }, [dateStocks]);

  return (
    <div className="zhongjun">
      <div className="title">中军涨停趋势</div>
      <Line {...zhongjunConfig} />
    </div>
  );
};
