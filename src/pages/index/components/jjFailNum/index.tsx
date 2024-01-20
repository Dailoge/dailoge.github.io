import { useMemo } from 'react';
import dayjs from 'dayjs';
import { Line } from '@ant-design/plots';
import { IDateStock, IZTDTStockInfo } from '@/types';

import './index.less';

interface IProps {
  dateStocks: IDateStock[];
}

export default (props: IProps) => {
  const { dateStocks } = props;

  // 晋级失败跌停 config
  const jjFailConfig = useMemo(() => {
    const data: {
      date: string;
      value: number;
      dtName: string;
    }[] = [];
    dateStocks.forEach((item, index) => {
      const dtList = item.dtList;
      const preZtList = index === 0 ? [] : dateStocks[index - 1].ztList;
      const jjFailList = dtList.filter((i) =>
        preZtList.find((j) => i.code === j.code),
      );
      data.push({
        date: dayjs(item.date).format('MM-DD'),
        value: jjFailList.length,
        dtName: jjFailList
          .map((i) => {
            const preZt = preZtList.find(
              (j) => i.code === j.code,
            ) as IZTDTStockInfo;
            return {
              name: i.name,
              lbc: preZt.lbc,
            };
          })
          .sort((a, b) => b.lbc - a.lbc)
          .map((item) => `${item.name}(${item.lbc}板)`)
          .join(),
      });
    });

    const jjFailAvg =
      data.reduce((pre, item) => pre + item.value, 0) / data.length;

    const config = {
      data,
      height: 230,
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
      // 辅助线
      annotations: [
        {
          type: 'line',
          start: ['min', jjFailAvg],
          end: ['max', jjFailAvg],
          style: {
            stroke: '#1890ff',
            lineDash: [4, 2],
            lineWidth: 2,
          },
        },
      ],
    };
    return config;
  }, [dateStocks]);

  return (
    <div className="jj-fail">
      <div className="title">晋级失败跌停趋势</div>
      <Line {...jjFailConfig} />
    </div>
  );
};
