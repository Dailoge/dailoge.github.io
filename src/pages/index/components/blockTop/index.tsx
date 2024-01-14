import { useState, useMemo, useEffect, useCallback } from 'react';
import { Line } from '@ant-design/plots';
import { reverse } from 'lodash-es';
import dayjs from 'dayjs';
import { getStockBlockUpByDate } from '@/services';
import { IStockBlockUp } from '@/types';

import './index.less';

interface IProps {
  recentWorkdays: string[];
}

export default (props: IProps) => {
  const { recentWorkdays } = props;
  const [stockBlockList, setStockBlockList] = useState<
    Array<{
      date: string;
      stockBlockList: IStockBlockUp[];
    }>
  >([]);

  const stockBlockConfig = useMemo(() => {
    type IStockBlockUpExtend = IStockBlockUp & { date: string };
    const data: IStockBlockUpExtend[] = [];
    const limtBlockMap: { [key: string]: IStockBlockUpExtend[] } = {};
    stockBlockList.forEach((item) => {
      const top1BlockCode = item.stockBlockList[0].code;
      // 如果之前已经有数据，则直接返回
      if (data.find((blockItem) => blockItem.code === top1BlockCode)) return;
      const oneLineData: IStockBlockUpExtend[] = [];
      stockBlockList.forEach((item1) => {
        const findRes = item1.stockBlockList.find(
          (blockItem) => blockItem.code === top1BlockCode,
        );
        const handleDate = dayjs(item1.date).format('MMDD');
        if (findRes) {
          oneLineData.push({
            ...findRes,
            date: handleDate,
          });
        }
      });
      limtBlockMap[top1BlockCode] = oneLineData;
    });

    Object.keys(limtBlockMap)
      .sort((a, b) => limtBlockMap[b].length - limtBlockMap[a].length)
      .slice(0, 2)
      .forEach((key) => {
        data.push(...limtBlockMap[key]);
      });

    const config = {
      data,
      height: 230,
      yField: 'limit_up_num',
      xField: 'date',
      seriesField: 'name',
      yAxis: {
        min: 0, // 设置Y轴的最小值
      },
      point: {
        size: 4,
        style: {
          lineWidth: 1,
          fillOpacity: 1,
        },
        shape: 'circle',
      },
      label: {
        formatter: (item: IStockBlockUpExtend) => {
          const top1 = item.stock_list.sort((a, b) => b.continue_num - a.continue_num)[0];
          return `${top1.name}(${top1.continue_num})`;
        }
      },
    };
    return config;
  }, [stockBlockList]);

  const getStockBlockList = useCallback(async () => {
    return Promise.all(
      recentWorkdays.slice(0, 7).map(async (date) => {
        const data = await getStockBlockUpByDate(date);
        return { date, stockBlockList: data };
      }),
    );
  }, []);

  useEffect(() => {
    getStockBlockList().then((data) => setStockBlockList(reverse(data)));
  }, []);

  return (
    <div className="stock-block-up">
      <div className="title">概念赚钱效应趋势</div>
      <Line {...stockBlockConfig} />
    </div>
  );
};
