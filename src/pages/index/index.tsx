import { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';
import { getZDStocksByMaiRui } from '@/services';
import { sleep } from '@/utils';
import './index.less';

const preDays = 5; // 从当前时间截止到 10 天之前

export default function HomePage() {
  const [dateZDStocksMap, setDateZDStocksMap] = useState({});

  const getData = useCallback(async () => {
    const map: { [key: string]: any } = {};
    for await (const index of [...new Array(preDays).keys()]) {
      const date = dayjs().subtract(index, 'day').format('YYYY-MM-DD');
      const stockList = await getZDStocksByMaiRui(date);
      map[date] = stockList;
    }
    return map;
  }, []);

  useEffect(() => {
    getData().then(map => {
      setDateZDStocksMap(map);
    })
  }, []);

  useEffect(() => {
    console.log(dateZDStocksMap);
  }, [dateZDStocksMap])

  return <div className="index-container">{JSON.stringify(dateZDStocksMap)}</div>;
}
