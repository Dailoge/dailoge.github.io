import { useEffect, useMemo, useState, useCallback } from 'react';
import dayjs from 'dayjs';
import { Line } from '@ant-design/plots';
import { Collapse, Toast, Tag } from 'antd-mobile';
import { reverse, cloneDeep } from 'lodash-es';
import {
  getStockInfo,
  getLbStockByDate,
  getJianGuanStock,
  getStockBlockUpByDate,
} from '@/services';
import { IDateStock, ILbStock, IJianGuanStock, IStockBlockUp } from '@/types';

import './index.less';

interface IProps {
  dateStocks: IDateStock[];
  recentWorkdays: string[];
  latestWorkDay: string;
}

export default (props: IProps) => {
  const { dateStocks, recentWorkdays } = props;
  const [limitTopStocks, setLimitTopStocks] = useState<
    Array<{
      date: string;
      lbStockList: ILbStock[];
    }>
  >([]);
  const [jianGuanStocks, setJianGuanStocks] = useState<IJianGuanStock[]>([]);
  const [stockBlockTop, setStockBlockTop] = useState<IStockBlockUp[]>([]);
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

  const getLbStockData = useCallback(async () => {
    return Promise.all(
      recentWorkdays.map(async (date) => {
        const lbStocks = await getLbStockByDate(date);
        return {
          date,
          lbStockList: lbStocks,
        };
      }),
    );
  }, []);

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
    limitTopStocks.forEach((item) => {
      const zgbItem = item.lbStockList[0];
      const lbName = zgbItem.code_list.map(l => l.name).join();
      data.push({
        date: dayjs(item.date).format('MMDD'),
        value: zgbItem.height,
        isZgb: false,
        code: zgbItem.code_list[0].code,
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
      // 滑动块先注释
      // slider: {
      //   end: 1,
      //   start: 0,
      // },
      height: 200,
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
  }, [limitTopStocks]);

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

  useEffect(() => {
    getLbStockData().then((list) => setLimitTopStocks(reverse(list)));
    getJianGuanStock().then(setJianGuanStocks);
    getStockBlockUpByDate(props.latestWorkDay).then(setStockBlockTop);
  }, []);

  const renderLbContent = useMemo(() => {
    if (!dateStocks.length) return null;
    const latestDayStocks = cloneDeep(dateStocks[dateStocks.length - 1]);
    const latestDayZtList = latestDayStocks.ztList;
    const latestDayLbData = limitTopStocks[limitTopStocks.length - 1];
    const content = latestDayLbData.lbStockList.map((limitTopItem) => {
      const limitTopStocksLine = limitTopItem.code_list.map((lbItem) => {
        const item = latestDayZtList.find((i) => i.name === lbItem.name);
        if (!item) {
          Toast.show({
            content: `${lbItem.name} 在当日涨停板中未找到~`,
          });
          return null;
        }
        const handleDm = item.code;
        const beginLbMinPrice = 6;
        const beginLbMaxPrice = 16;
        const isLikePrice =
          item.price >=
            beginLbMinPrice * Math.pow(1.1, Number(limitTopItem.height)) &&
          item.price <=
            beginLbMaxPrice * Math.pow(1.1, Number(limitTopItem.height));
        const isLikeCJE = item.cje <= 1500000000;
        const jianGuanRes = jianGuanStocks.find(
          (jianGuanItem) => jianGuanItem.code === handleDm,
        );
        const stockBlocks = stockBlockTop.filter((blockItem) =>
          blockItem.stock_list.find((stock) => stock.code === handleDm),
        );
        return (
          <div
            key={item.code}
            className={`limit-top-stocks-item ${
              isLikePrice && isLikeCJE ? 'is-like-price' : ''
            }`}
            onClick={() => {
              if (handleDm.startsWith('60')) {
                window.open(
                  `https://wap.eastmoney.com/quote/stock/1.${handleDm}.html`,
                );
              } else {
                window.open(
                  `https://wap.eastmoney.com/quote/stock/0.${handleDm}.html`,
                );
              }
            }}
          >
            {`${item.name}(${item.price.toString().split('.')[0]}元)`}
            {!!jianGuanRes && (
              <span
                className="jian-guan"
                onClick={(e) => {
                  if (jianGuanRes.link) {
                    window.open(jianGuanRes.link);
                  } else {
                    Toast.show({
                      content: '未找到相关描述文件~',
                    });
                  }
                  e.stopPropagation();
                }}
              >
                <Tag color="danger">监管</Tag>
              </span>
            )}
            {item.code.startsWith('300') && (
              <span className="chuangyeban">
                <Tag color="default">创</Tag>
              </span>
            )}
            {stockBlocks.length > 0 && (
              <span className="stock-block">
                <Tag color="primary">
                  {stockBlocks.map((blockItem) => blockItem.name).join()}
                </Tag>
              </span>
            )}
          </div>
        );
      });
      return (
        <div className="limit-top-stocks-line" key={limitTopItem.height}>
          <div className="limit-top-stocks-lbs">{limitTopItem.height}板</div>
          <div className="limit-top-stocks-container">{limitTopStocksLine}</div>
        </div>
      );
    });
    return content;
  }, [limitTopStocks, dateStocks, jianGuanStocks, stockBlockTop]);

  return (
    <div className="zgb">
      <div className="title">最高板趋势</div>
      <Line {...zgbConfig} />
      <div className="limit-top-stocks">{renderLbContent}</div>
      <Collapse accordion>
        <Collapse.Panel key="1" title="最高板晋级失败后表现">
          <div className="zgb-jj-fails-warp">
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
                      <span
                        className={`${Number(openRadio) > 0 ? 'zf' : 'df'}`}
                      >
                        {openRadio}%
                      </span>
                    </div>
                    <div className="column">{amplitude}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        </Collapse.Panel>
      </Collapse>
    </div>
  );
};
