import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { Line } from '@ant-design/plots';
import { Toast } from 'antd-mobile';
import { CloseCircleOutline } from 'antd-mobile-icons';
import { IDateStock, IZTDTStockInfo } from '@/types';

import './index.less';

interface IProps {
  dateStocks: IDateStock[];
}

export default (props: IProps) => {
  const { dateStocks } = props;
  const [medianJJFailList, setMedianJJFailList] = useState<IZTDTStockInfo[]>(
    [],
  );

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
      const medianJJFailList = jjFailList
        .map((i) => {
          const preZt = preZtList.find(
            (j) => i.code === j.code,
          ) as IZTDTStockInfo;
          return preZt;
        })
        .filter(item => item.lbc >= 4)
        .sort((a, b) => b.lbc - a.lbc);
      setMedianJJFailList(medianJJFailList);
      data.push({
        date: dayjs(item.date).format('MMDD'),
        value: medianJJFailList.length,
        dtName: medianJJFailList
          .map((item) => `${item.name}(${item.lbc}板)`)
          .join(),
      });
    });

    // const jjFailAvg =
    //   data.reduce((pre, item) => pre + item.value, 0) / data.length;

    const config = {
      data,
      height: 150,
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
          start: ['min', 2],
          end: ['max', 2],
          style: {
            stroke: '#f13611',
            lineDash: [4, 2],
            lineWidth: 2,
          },
        },
      ],
    };
    return config;
  }, [dateStocks]);

  useEffect(() => {
    if (medianJJFailList.length >= 2) {
      Toast.show({
        content: '中位股出现明显亏钱效应，及时清仓~',
        icon: <CloseCircleOutline />,
      });
    }
  }, [medianJJFailList]);

  return (
    <div className="jj-fail">
      <div className="title">晋级失败跌停趋势</div>
      <Line {...jjFailConfig} />
    </div>
  );
};
