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

  // 涨跌停 config
  const zdtConfig = useMemo(() => {
    const data: {
      date: string;
      value: number;
      dtTitle?: string;
      category: string;
    }[] = [];
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
        dtTitle: item.dtList
          .sort((a, b) => b.lbc - a.lbc)
          .map((dt) => `${dt.name}(${dt.lbc}板)`)
          .join(', '),
      });
    });

    const ztAvg =
      dateStocks.reduce((pre, item) => pre + item.ztList.length, 0) /
      dateStocks.length;
    const dtAvg =
      dateStocks.reduce((pre, item) => pre + item.dtList.length, 0) /
      dateStocks.length;

    const config = {
      data,
      height: 320,
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
      // 悬浮展示内容
      tooltip: {
        showTitle: true,
        position: 'top',
        customContent: (date: string, data: any) => {
          const content = data?.[1]?.data.dtTitle;
          if (!content) return;
          return (
            <div
              style={{
                padding: '2px',
                lineHeight: '20px',
              }}
            >
              跌停: {content}
              <p style={{ textAlign: 'right' }}>{date}</p>
            </div>
          );
        },
      },
      // label
      label: {
        formatter: (item: { value: any }) => item.value,
      },
      // 辅助线
      annotations: [
        {
          type: 'line',
          start: ['min', ztAvg],
          end: ['max', ztAvg],
          style: {
            stroke: '#F4664A',
            lineDash: [4, 2],
            lineWidth: 2,
          },
        },
        {
          type: 'line',
          start: ['min', dtAvg],
          end: ['max', dtAvg],
          style: {
            stroke: '#5AD8A6',
            lineDash: [4, 2],
            lineWidth: 2,
          },
        },
      ],
    };
    return config;
  }, [dateStocks]);

  return (
    <div className="zt-dt">
       <div className="zt-dt">
        <div className="title">涨跌停趋势</div>
        <Line {...zdtConfig} />
      </div>
    </div>
  );
};