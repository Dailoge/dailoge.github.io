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
    type IDataItem = {
      date: string;
      value: number;
      dtTitle?: string;
      total: number;
      category: string;
    };
    const data: IDataItem[] = [];
    dateStocks.forEach((item) => {
      const ztValue = item.ztList.length;
      const dtValue = item.dtList.length;
      data.push({
        date: dayjs(item.date).format('MMDD'),
        value: ztValue,
        category: '涨停',
        total: item.ztTotal,
      });
      data.push({
        date: dayjs(item.date).format('MMDD'),
        value: dtValue,
        category: '跌停',
        total: item.dtTotal,
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
      height: 220,
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
          return (
            <div
              className="tooltip"
              style={{
                padding: '2px',
                lineHeight: '20px',
              }}
            >
              <p className="text">
                总计 {data?.[0]?.data.total} 家涨停，{data?.[1]?.data.total}{' '}
                家跌停；
              </p>
              {content && <p className="text">跌停: {content}；</p>}
              <p className="text" style={{ textAlign: 'right' }}>
                {date}
              </p>
            </div>
          );
        },
      },
      // label
      label: {
        formatter: (item: IDataItem) =>
          item.total > 200 ? '200+' : item.total,
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
