import { useState, useEffect, useCallback } from 'react';
import { reverse } from 'lodash-es';
import ZtdtComp from './components/ztdt';
import ZgbComp from './components/zgb';
import LbNumComp from './components/lbNum';
import JjFailNumComp from './components/jjFailNum';
import MarketAmountComp from './components/marketAmount';
import LbJJComp from './components/lbJJ';
import { getZTDTStocksByBiYing } from '@/services';
import { getRecentWorkdays } from '@/utils';
import { IDateStock } from '@/types';

import './index.less';

// 获取最近的两个月
const recentWorkCountDays = 45;
const recentWorkdays = getRecentWorkdays(recentWorkCountDays);

export default function HomePage() {
  const [dateStocks, setDateStocks] = useState<Array<IDateStock>>([]);

  const getZTDTData = useCallback(async () => {
    return Promise.all(
      recentWorkdays.map(async (date) => {
        const data = await getZTDTStocksByBiYing(date);
        return { date, ztList: data.ztList, dtList: data.dtList };
      }),
    );
  }, []);

  useEffect(() => {
    getZTDTData().then((allDateStocks) => {
      setDateStocks(reverse(allDateStocks));
    });
  }, []);

  return (
    <div className="index-container">
      <ZtdtComp dateStocks={dateStocks} />
      <ZgbComp dateStocks={dateStocks} />
      <LbJJComp recentWorkCountDays={recentWorkCountDays} />
      <MarketAmountComp recentWorkdays={recentWorkdays} />
      <JjFailNumComp dateStocks={dateStocks} />
      <LbNumComp dateStocks={dateStocks} />
    </div>
  );
}
