import { useState, useEffect, useCallback, useMemo } from 'react';
import { Line, Column } from '@ant-design/plots';
import { reverse } from 'lodash-es';
import dayjs from 'dayjs';
import {
  getZTDTStocksByBiYing,
  getStockInfo,
  IZTDTStockInfo,
} from '@/services';
import { getRecentWorkdays } from '@/utils';
import './index.less';

// 获取最近的n个工作日
const recentWorkdays = getRecentWorkdays(35);

export default function HomePage() {
  const [dateStocks, setDateStocks] = useState<
    Array<{
      date: string;
      ztList: IZTDTStockInfo[];
      dtList: IZTDTStockInfo[];
    }>
  >([]);
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
  const [marketAmountList, setMarketAmountList] = useState<
    Array<{
      date: string;
      amount: number;
    }>
  >([]);

  const getZTDTData = useCallback(async () => {
    return Promise.all(
      recentWorkdays.map(async (date) => {
        const data = await getZTDTStocksByBiYing(date);
        return { date, ztList: data.ztList, dtList: data.dtList };
      }),
    );
  }, []);

  const getMarketAmountData = useCallback(async () => {
    return Promise.all(
      recentWorkdays.map(async (date) => {
        const [shData, szData] = await Promise.all([getStockInfo('SH000001', date), getStockInfo('SZ399001', date)]);
        const amount = ((shData?.amount || 0) + (szData?.amount || 0)) / 100000000;
        return {
          date,
          amount: Math.round(amount),
          shData,
          szData,
        }
      }),
    );
  }, []);

  useEffect(() => {
    getZTDTData().then((allDateStocks) => {
      setDateStocks(reverse(allDateStocks));
    });
    getMarketAmountData().then(marketAmountList => {
      setMarketAmountList(reverse(marketAmountList));
    });
  }, []);

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
          .map((dt) => `${dt.mc}(${dt.lbc}板)`)
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
      height: 350,
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
        preZtList.find((j) => i.dm === j.dm),
      );
      data.push({
        date: dayjs(item.date).format('MM-DD'),
        value: jjFailList.length,
        dtName: jjFailList
          .map((i) => {
            const preZt = preZtList.find(
              (j) => i.dm === j.dm,
            ) as IZTDTStockInfo;
            return {
              mc: i.mc,
              lbc: preZt.lbc,
            };
          })
          .sort((a, b) => b.lbc - a.lbc)
          .map((item) => `${item.mc}(${item.lbc}板)`)
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

  // 市场总成交额趋势
  const marketAmoutConfig = useMemo(() => {
    console.log(marketAmountList);
    const marketAmoutAvg =
      marketAmountList.reduce((pre, item) => pre + item.amount, 0) / marketAmountList.length;

    const config = {
      data: marketAmountList,
      height: 230,
      yField: 'amount',
      xField: 'date',
      yAxis: {
        min: 5000, // 设置Y轴的最小值
      },
      point: {
        size: 4,
        style: {
          lineWidth: 1,
          fillOpacity: 1,
        },
        shape: 'circle',
      },
      // 悬浮展示内容
      // tooltip: {
      //   title: 'dtName',
      //   formatter: (datum: { value: number; date: string }) => {
      //     return { name: datum.value, value: datum.date };
      //   },
      // },
      // label
      label: {
        formatter: (item: { amount: number; date: string }) => item.amount,
      },
      // 辅助线
      annotations: [
        {
          type: 'line',
          start: ['min', marketAmoutAvg],
          end: ['max', marketAmoutAvg],
          style: {
            stroke: '#1890ff',
            lineDash: [4, 2],
            lineWidth: 2,
          },
        },
      ],
    };
    return config;
  }, [marketAmountList]);

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

  // 连板 config
  const lbConfig = useMemo(() => {
    const data: { date: string; value: number; category: string }[] = [];
    dateStocks.slice(-11).forEach((item, index) => {
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

  return (
    <div className="index-container">
      <div className="zt-dt">
        <div className="title">涨跌停趋势</div>
        <Line {...zdtConfig} />
      </div>
      <div className="jj-fail">
        <div className="title">晋级失败跌停趋势</div>
        <Line {...jjFailConfig} />
      </div>
      <div className="market-amount">
        <div className="title">市场总成交额趋势</div>
        <Line {...marketAmoutConfig} />
      </div>
      <div className="zgb">
        <div className="title">最高板趋势</div>
        <Line {...zgbConfig} />
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
      <div className="lb">
        <div className="title">连板趋势</div>
        <Column {...lbConfig} />
      </div>
    </div>
  );
}
