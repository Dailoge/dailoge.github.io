import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { Line } from '@ant-design/plots';
import { reverse, cloneDeep } from 'lodash-es';
import { getStockInfo } from '@/services';
import { IDateStock } from '@/types';

import './index.less';

interface IProps {
  dateStocks: IDateStock[];
}

export default (props: IProps) => {
  const { dateStocks } = props;
  const [zgbJJFails, setZgbJJFails] = useState<
    Array<{
      date: string;
      name: string;
      zgb: number;
      percent?: number;
      amplitude?: string;
      openRadio?: string;
    }>
  >([]);

  // 最高板 config
  const zgbConfig = useMemo(() => {
    const data: {
      date: string; // 12-01
      originDate: string; // 2023-12-01
      value: number;
      isZgb: boolean;
      code: string;
      name: string;
      lbName: string;
    }[] = [];
    dateStocks.forEach((item, index) => {
      const list = item.ztList.length
        ? item.ztList
        : dateStocks[index - 1]?.ztList;
      list.sort((a, b) => Number(b.lbc) - Number(a.lbc));
      // 最高板同时可能有多个
      const lbName = list
        .filter((item) => item.lbc === list[0].lbc)
        .map((item) => item.mc)
        .join();
      data.push({
        date: dayjs(item.date).format('MM-DD'),
        value: Number(list[0].lbc),
        isZgb: false,
        code: list[0].dm,
        originDate: item.date,
        name: lbName.length > 7 ? lbName.substring(0, 8) + '...' : lbName,
        lbName,
      });
    });
    data.forEach((item, index) => {
      const nextValue = index === data.length - 1 ? 0 : data[index + 1].value;
      // 算出波峰，即是最高板
      if (item.value >= nextValue) {
        item.isZgb = true;
      }
    });
    const zgbAvg =
      data.reduce((pre, item) => pre + item.value, 0) / data.length;

    const config = {
      data,
      slider: {
        end: 1,
        start: 0,
      },
      height: 230,
      yField: 'value',
      xField: 'date',
      yAxis: {
        min: 2, // 设置Y轴的最小值
      },
      tooltip: {
        title: 'lbName',
        formatter: (datum: { value: number; date: string }) => {
          return { name: datum.value, value: datum.date };
        },
      },
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
        formatter: (item: { value: string; name: string; isZgb: boolean }) => {
          if (item.isZgb) {
            return `${item.name}(${item.value})`;
          }
          return item.value;
        },
      },
      // 辅助线
      annotations: [
        {
          type: 'line',
          start: ['min', zgbAvg],
          end: ['max', zgbAvg],
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

  useEffect(() => {
    const data = zgbConfig.data;
    const zbgJJFail: {
      date: string;
      name: string;
      zgb: number;
      code: string;
    }[] = [];
    data.forEach((item, index) => {
      const curZgb = item.value;
      const preZgb = index === 0 ? 0 : data[index - 1].value;
      if (curZgb <= preZgb) {
        zbgJJFail.push({
          date: item.originDate,
          name: data[index - 1].name,
          zgb: data[index - 1].value,
          code: data[index - 1].code,
        });
      }
    });

    const zgbJJFailList = Promise.all(
      zbgJJFail.map(async (item) => {
        const { date, zgb, name, code } = item;
        const res = await getStockInfo(code, date);
        return {
          ...res,
          zgb,
          name,
          date,
        };
      }),
    );

    zgbJJFailList.then((list) => setZgbJJFails(reverse(list)));
  }, [zgbConfig]);

  // 大于 3 板的个股
  const limitTopStocks = useMemo(() => {
    if (!dateStocks.length) return [];
    const latestDayStocks = cloneDeep(dateStocks[dateStocks.length - 1]);
    latestDayStocks.ztList.sort((a, b) => b.lbc - a.lbc);
    return latestDayStocks.ztList.filter((item) => item.lbc >= 3);
  }, [dateStocks]);

  return (
    <div className="zgb">
      <div className="title">最高板趋势</div>
      <Line {...zgbConfig} />
      <div className="limit-top-stocks">
        {limitTopStocks.map((item) => {
          return (
            <div
              key={item.dm}
              className="limit-top-stocks-item"
              onClick={() => {
                const handleDm = item.dm.replace(/[a-z]/gi, '');
                if (handleDm.startsWith('0')) {
                  window.open(
                    `https://wap.eastmoney.com/quote/stock/0.${handleDm}.html`,
                  );
                } else {
                  window.open(
                    `https://wap.eastmoney.com/quote/stock/1.${handleDm}.html`,
                  );
                }
              }}
            >
              {`${item.mc}(${item.lbc}板,开板${item.zbc}次)`}
            </div>
          );
        })}
      </div>
      <div className="zgb-jj-fails-warp">
        <div className="zgb-jj-fail-title">最高板晋级失败后表现</div>
        <div className="zgb-jj-fails-container">
          <div className="zgb-jj-fail-item header" key={123456}>
            <div className="column">日期</div>
            <div className="column name">名称</div>
            <div className="column">涨跌幅</div>
            <div className="column">开盘</div>
            <div className="column">振幅</div>
          </div>
          {zgbJJFails.map((item) => {
            const { date, name, zgb, percent, openRadio, amplitude } = item;
            return (
              <div className="zgb-jj-fail-item" key={date}>
                <div className="column">{date}</div>
                <div className="column name">
                  {name}({`${zgb}进${zgb + 1}失败`})
                </div>
                <div className="column">
                  <span className={`${Number(percent) > 0 ? 'zf' : 'df'}`}>
                    {percent}%
                  </span>
                </div>
                <div className="column">
                  <span className={`${Number(openRadio) > 0 ? 'zf' : 'df'}`}>
                    {openRadio}%
                  </span>
                </div>
                <div className="column">{amplitude}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
