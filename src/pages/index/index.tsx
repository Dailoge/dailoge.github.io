import { useState, useEffect, useCallback, useMemo } from 'react';
import { reverse, cloneDeep } from 'lodash-es';
import { Skeleton } from 'antd-mobile';
import ZtdtComp from './components/ztdt';
import ZgbComp from './components/zgb';
// import ZjNumComp from './components/zjNum';
import LbNumComp from './components/lbNum';
import JjFailNumComp from './components/jjFailNum';
import MarketAmountComp from './components/marketAmount';
import LbMakeMoneyComp from './components/lbMakeMoney';
import MatchLhbComp from './components/matchLhb';
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

  const { latestDayZtList, latestDayDtList } = useMemo(() => {
    if (dateStocks.length === 0)
      return {
        latestDayZtList: [],
        latestDayDtList: [],
      };
    const latestDayStocks = cloneDeep(dateStocks[dateStocks.length - 1]);
    return {
      latestDayZtList: latestDayStocks.ztList,
      latestDayDtList: latestDayStocks.dtList,
    };
  }, [dateStocks]);

  return (
    <div className="index-container">
      {loading && (
        <div className="loading">
          <Skeleton.Title animated />
          <Skeleton.Paragraph lineCount={10} animated />
          <Skeleton.Title animated />
          <Skeleton.Paragraph lineCount={10} animated />
          <Skeleton.Title animated />
          <Skeleton.Paragraph lineCount={10} animated />
          <Skeleton.Title animated />
          <Skeleton.Paragraph lineCount={10} animated />
        </div>
      )}
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
        {/* <ZjNumComp dateStocks={dateStocks} /> */}
        {/* <BlockTopComp recentWorkdays={recentWorkdays} /> */}
        <LbMakeMoneyComp recentWorkCountDays={recentWorkCountDays} />
        <JjFailNumComp dateStocks={dateStocks} />
        <MarketAmountComp recentWorkdays={recentWorkdays} />
        <MatchLhbComp
          latestWorkDay={recentWorkdays[0]}
          latestDayZtList={latestDayZtList}
          latestDayDtList={latestDayDtList}
        />
        <LbNumComp dateStocks={dateStocks} />
      </div>
    </div>
  );
}
