import { useEffect, useMemo, useState, useCallback } from 'react';
import dayjs from 'dayjs';
import { Line } from '@ant-design/plots';
import { Button, Collapse, Toast, Tag, Selector } from 'antd-mobile';
import { reverse, cloneDeep } from 'lodash-es';
import {
  getStockInfo,
  getLbStockByDate,
  getJianGuanStock,
  getStockBlockUpByDate,
  getHotStockTop,
} from '@/services';
import { formatFDE } from '@/utils';
import {
  IDateStock,
  ILbStock,
  IJianGuanStock,
  IStockBlockUp,
  IHotStock,
} from '@/types';

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
  const [hotTopStocks, setHotTopStocks] = useState<IHotStock[]>([]);
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
  const [selectTopBlockValue, setSelectTopBlockValue] = useState<string[]>([]);

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
    type IData = {
      index: number;
      date: string; // 12-01
      originDate: string; // 2023-12-01
      value: number;
      isZgb: boolean;
      code: string;
      codeList: ILbStock['code_list'];
      name: string;
      lbName: string;
    };
    const data: IData[] = [];
    limitTopStocks.forEach((item, index) => {
      const zgbItem = item.lbStockList?.[0];
      if (!zgbItem) return;
      const lbName = zgbItem.code_list.map((l) => l.name).join();
      data.push({
        index,
        date: dayjs(item.date).format('MMDD'),
        value: zgbItem.height,
        isZgb: false,
        code: zgbItem.code_list[0].code,
        codeList: zgbItem.code_list,
        originDate: item.date,
        name: lbName.length > 7 ? lbName.substring(0, 8) + '...' : lbName,
        lbName,
      });
    });
    data.forEach((item, index) => {
      const preValue = index === 0 ? 0 : data[index - 1].value;
      const nextValue = index === data.length - 1 ? 0 : data[index + 1].value;
      // 算出波峰，即是最高板
      if (preValue < item.value && item.value > nextValue) {
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
      height: 220,
      yField: 'value',
      xField: 'date',
      yAxis: {
        min: 3, // 设置Y轴的最小值
      },
      tooltip: {
        title: 'lbName',
        formatter: (datum: IData) => {
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
        formatter: (item: IData) => {
          if (item.isZgb) {
            return `${item.name}(${item.value})`;
          }
          if (item.codeList.length === 1) {
            if (item.value > data[item.index - 1]?.value) return '🐲';
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
    getHotStockTop().then(setHotTopStocks);
  }, []);

  const renderBlockTopSelectContent = useMemo(() => {
    const topBlockList = stockBlockTop.slice(0, 9);
    const options = topBlockList.map((item, index) => {
      const change = item.change?.toFixed(1) || 0;
      return {
        label: `${index + 1}. ${item.name}(${item.limit_up_num}家,${change}%)`,
        value: item.code,
      };
    });
    return (
      <div className="block-top-select-container">
        <Selector
          options={options}
          defaultValue={selectTopBlockValue}
          onChange={(arr) => setSelectTopBlockValue(arr)}
        />
      </div>
    );
  }, [stockBlockTop]);

  const renderLbContent = useMemo(() => {
    if (!dateStocks.length) return null;
    const latestDayStocks = cloneDeep(dateStocks[dateStocks.length - 1]);
    // 按第一次涨停时间排序
    const latestDayZtList = latestDayStocks.ztList
      .slice(0, -1)
      .sort((a, b) => Number(a.fbt) - Number(b.fbt));
    const latestDayLbData = limitTopStocks[limitTopStocks.length - 1];
    const lbStockList = [...(latestDayLbData?.lbStockList || [])];
    const zhongjunList = latestDayZtList
      .filter((item) => {
        return (item?.cje as number) >= 2500000000; // 大于 25 亿
      })
      .sort((a, b) => Number(a.fbt) - Number(b.fbt));
    if (zhongjunList.length > 0) {
      const zhongjunInfo = {
        number: zhongjunList.length,
        // TODO：height 类型是数字的
        height: '中军',
        code_list: zhongjunList,
      } as any as ILbStock;
      lbStockList.push(zhongjunInfo);
    }
    const content = lbStockList.map((limitTopItem) => {
      const limitTopStocksLine = limitTopItem?.code_list
        ?.map((lbItem) => {
          const ztListIndex = latestDayZtList.findIndex(
            (i) => i.name === lbItem.name,
          );
          const item = latestDayZtList[ztListIndex];
          const handleDm = lbItem.code;
          const beginLbMinPrice = 6;
          const beginLbMaxPrice = 16;
          const isLikePrice =
            (item?.price as number) >=
              beginLbMinPrice * Math.pow(1.1, Number(limitTopItem.height)) &&
            (item?.price as number) <=
              beginLbMaxPrice * Math.pow(1.1, Number(limitTopItem.height));
          const isZhongJun = (item?.cje as number) >= 2500000000; // 大于 25 亿
          const isBigFDE = (item?.fde as number) > 300000000;
          const jianGuanRes = jianGuanStocks.find(
            (jianGuanItem) => jianGuanItem.code === handleDm,
          );
          const stockBlocks = stockBlockTop.filter((blockItem) =>
            blockItem.stock_list.find((stock) => stock.code === handleDm),
          );
          const hotOrderRes = hotTopStocks.find(
            (hotItem) => hotItem.code === handleDm,
          );
          if (selectTopBlockValue.length) {
            if (
              !stockBlocks.find((item) => item.code === selectTopBlockValue[0])
            ) {
              return null;
            }
          }
          if(!item) return null;
          return (
            <div
              key={lbItem.code}
              className={`limit-top-stocks-item`}
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
              {`${lbItem.name}(${
                item?.price.toString().split('.')[0] || '--'
              }元)`}
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
              <span className="stock-info">
                {dayjs(Number(item.fbt) * 1000).isBefore(
                  dayjs(Number(item.fbt) * 1000)
                    .set('hour', 10)
                    .set('minute', 30),
                ) && (
                  <Tag color={ztListIndex < 10 ? 'warning' : 'default'}>
                    {ztListIndex + 1}
                  </Tag>
                )}
                <Tag color={'default'}>{item.type}</Tag>
                {lbItem.code.startsWith('30') && <Tag color="warning">创</Tag>}
                {isZhongJun && <Tag color="#2db7f5">中军</Tag>}
                {
                  <Tag color={isBigFDE ? '#17d068' : 'default'}>
                    {formatFDE(item?.fde as number)}
                  </Tag>
                }
                {!!hotOrderRes && hotOrderRes.order <= 30 && (
                  <Tag color={hotOrderRes.order <= 5 ? 'success' : 'default'}>
                    人气{hotOrderRes.order}
                  </Tag>
                )}
              </span>
              {stockBlocks.length > 0 && (
                <span className="stock-block">
                  <Tag color="primary">
                    {stockBlocks.map((blockItem) => blockItem.name).join()}
                  </Tag>
                </span>
              )}
            </div>
          );
        })
        .filter((item) => !!item);
      return (
        <div className="limit-top-stocks-line" key={limitTopItem.height}>
          <div className="limit-top-stocks-lbs">{limitTopItem.height}板</div>
          <div className="limit-top-stocks-container">{limitTopStocksLine}</div>
        </div>
      );
    });
    return content;
  }, [
    limitTopStocks,
    dateStocks,
    jianGuanStocks,
    stockBlockTop,
    hotTopStocks,
    selectTopBlockValue,
  ]);

  return (
    <div className="zgb">
      <div className="title">最高板趋势</div>
      <Line {...zgbConfig} />
      {limitTopStocks.length > 0 && (
        <div className="limit-top-stocks">
          {/* {renderBlockTopSelectContent} */}
          <div className="lb-content-container">
            {renderLbContent}
            <Button
              className="top-stocks-btn"
              color="primary"
              onClick={() => {
                window.open(
                  'https://eq.10jqka.com.cn/frontend/thsTopRank/index.html?tabName=regu&client_userid=vTteA&back_source=hyperlink&share_hxapp=isc&fontzoom=no#/',
                );
              }}
            >
              查看人气排行榜
            </Button>
          </div>
        </div>
      )}
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
