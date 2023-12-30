import { useMemo } from 'react';
import dayjs from 'dayjs';
import { Column } from '@ant-design/plots';
import { IDateStock } from '@/types';

import './index.less';

interface IProps {
  dateStocks: IDateStock[];
}

export default (props: IProps) => {
  const { dateStocks } = props;

  // 连板 config
  const lbConfig = useMemo(() => {
    const data: { date: string; value: number; category: string }[] = [];
    dateStocks.slice(-16).forEach((item, index) => {
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
        value: lb6bAndUp,
        category: '6板+',
      });
      data.push({
        date: dayjs(item.date).format('MM-DD'),
        value: lb5b,
        category: '5板',
      });
      data.push({
        date: dayjs(item.date).format('MM-DD'),
        value: lb4b,
        category: '4板',
      });
      data.push({
        date: dayjs(item.date).format('MM-DD'),
        value: lb3b,
        category: '3板',
      });
      data.push({
        date: dayjs(item.date).format('MM-DD'),
        value: lb2b,
        category: '2板',
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
        formatter: (item: { value: string; name: string }) =>
          Number(item.value) !== 0 ? item.value : '',
      },
      // legend: {
      //   layout: 'vertical',
      //   position: 'top'
      // }
    };
    return config;
  }, [dateStocks]);

  return (
    <div className="lb">
      <div className="title">连板趋势</div>
      <Column {...lbConfig} />
    </div>
  );
};
