import { useState, useEffect, useCallback } from 'react';
import { reverse } from 'lodash-es';
import ZtdtComp from './components/ztdt';
import ZgbComp from './components/zgb';
import LbComp from './components/lb';
import JjFailComp from './components/jjFail';
import MarketAmountComp from './components/marketAmount';
import {
  getZTDTStocksByBiYing,
  getStockLineInfoByThs,
} from '@/services';
import { getRecentWorkdays } from '@/utils';
import { IDateStock } from '@/types';

import './index.less';

// 获取最近的两个月
const recentWorkdays = getRecentWorkdays(60);

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
    getStockLineInfoByThs('883958', 45).then(console.log);
  }, []);

  return (
    <div className="index-container">
      <ZtdtComp dateStocks={dateStocks} />
      <ZgbComp dateStocks={dateStocks} />
      <MarketAmountComp recentWorkdays={recentWorkdays} />
      <JjFailComp dateStocks={dateStocks} />
      <LbComp dateStocks={dateStocks} />
    </div>
  );
}
