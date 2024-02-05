import { useState, useEffect, useCallback } from 'react';
import { reverse } from 'lodash-es';
import { DotLoading } from 'antd-mobile';
import ZtdtComp from './components/ztdt';
import ZgbComp from './components/zgb';
import LbNumComp from './components/lbNum';
import JjFailNumComp from './components/jjFailNum';
import MarketAmountComp from './components/marketAmount';
import LbMakeMoneyComp from './components/lbMakeMoney';
// import BlockTopComp from './components/blockTop';
import { getZTDTStockByDate } from '@/services';
import { getRecentWorkdays, optimizeStorage } from '@/utils';
import { IDateStock } from '@/types';

import './index.less';

// 获取最近的两个月
const recentWorkCountDays = 37;
const recentWorkdays = getRecentWorkdays(recentWorkCountDays);

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [dateStocks, setDateStocks] = useState<Array<IDateStock>>([]);

  const getZTDTData = useCallback(async () => {
    return Promise.all(
      recentWorkdays.map(async (date) => {
        const data = await getZTDTStockByDate(date);
        return { date, ...data };
      }),
    );
  }, []);

  useEffect(() => {
    getZTDTData().then((allDateStocks) => {
      setDateStocks(reverse(allDateStocks));
      setLoading(false);
    });
    optimizeStorage({
      minDay: recentWorkdays[recentWorkdays.length - 1],
    });
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <DotLoading color="currentColor" />
        <div className="text">加载中</div>
      </div>
    );
  }

  return (
    <div className="index-container">
      <div className="index-header">
        <img
          className="logo"
          src="https://s11.ax1x.com/2024/02/04/pFl2rKx.png"
        />
      </div>
      <div className="index-content">
        <ZtdtComp dateStocks={dateStocks} />
        <ZgbComp
          dateStocks={dateStocks}
          recentWorkdays={recentWorkdays}
          latestWorkDay={recentWorkdays[0]}
        />
        {/* <BlockTopComp recentWorkdays={recentWorkdays} /> */}
        <LbMakeMoneyComp recentWorkCountDays={recentWorkCountDays} />
        <MarketAmountComp recentWorkdays={recentWorkdays} />
        <JjFailNumComp dateStocks={dateStocks} />
        <LbNumComp dateStocks={dateStocks} />
      </div>
    </div>
  );
}
