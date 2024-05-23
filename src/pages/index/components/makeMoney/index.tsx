import { useState, useMemo, useEffect, useCallback } from 'react';
import { Line } from '@ant-design/plots';
import { Button, Toast } from 'antd-mobile';
import { CloseCircleOutline } from 'antd-mobile-icons';
import { getStockLineInfoByThs } from '@/services';

import './index.less';

interface IProps {
  recentWorkCountDays: number;
}

enum EMode {
  LIANBAN = 'LIANBAN', // 连板指数
  ZHONGXIAOPAN = 'ZHONGXIAOPAN', // 中小盘
}

export default (props: IProps) => {
  const { recentWorkCountDays } = props;
  const [mode, setMode] = useState<EMode>(EMode.LIANBAN);
  const [makeMoneyData, setMakeMoneyData] = useState<
    Array<{
      date: string;
      open: number;
      close: number;
      percent: number;
    }>
  >([]);

  // 连板赚钱效应趋势
  const makeMoneyConfig = useMemo(() => {
    // const llMakeMoneyAvg =
    //   makeMoneyData.reduce((pre, item) => pre + item.percent, 0) / makeMoneyData.length;

    const config = {
      data: makeMoneyData,
      height: 150,
      yField: 'percent',
      xField: 'date',
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
        formatter: (item: { percent: number; date: string }) => item.percent,
      },
      // 辅助线
      annotations: [
        {
          type: 'line',
          start: ['min', mode === EMode.LIANBAN ? 6 : 1],
          end: ['max', mode === EMode.LIANBAN ? 6 : 1],
          style: {
            stroke: '#f13611',
            lineDash: [4, 2],
            lineWidth: 2,
          },
        },
      ],
    };
    return config;
  }, [mode, makeMoneyData]);

  const queryMakeMoneyInfo = useCallback(async (mode: EMode) => {
    const code = mode === EMode.LIANBAN ? '883958' : '399852';
    const makeMoneyData = await getStockLineInfoByThs(
      code,
      recentWorkCountDays,
    );
    setMakeMoneyData(makeMoneyData);
  }, [recentWorkCountDays]);

  useEffect(() => {
    if (makeMoneyData.length && mode === EMode.LIANBAN) {
      if (makeMoneyData[makeMoneyData.length - 1].percent >= 6) {
        Toast.show({
          content: '短线情绪高潮，及时清仓~',
          icon: <CloseCircleOutline />,
        });
      }
    }
  }, [makeMoneyData]);

  useEffect(() => {
    queryMakeMoneyInfo(mode);
  }, []);

  return (
    <div className="make-money">
      <div className="title">
        <span
          className={mode === EMode.LIANBAN ? 'active' : 'normal'}
          onClick={() => {
            setMode(EMode.LIANBAN);
            queryMakeMoneyInfo(EMode.LIANBAN);
          }}
        >
          连板赚钱效应
        </span>
        /
        <span
          className={mode === EMode.ZHONGXIAOPAN ? 'active' : 'normal'}
          onClick={() => {
            setMode(EMode.ZHONGXIAOPAN);
            queryMakeMoneyInfo(EMode.ZHONGXIAOPAN);
          }}
        >
          中小盘赚钱效应
        </span>
        趋势
        <Button
          className="reload-btn"
          size="small"
          color="primary"
          onClick={() => queryMakeMoneyInfo(mode)}
        >
          刷新
        </Button>
      </div>
      <Line {...makeMoneyConfig} />
    </div>
  );
};
