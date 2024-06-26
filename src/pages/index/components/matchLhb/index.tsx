import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { getMatchBuyLongHuBang } from '@/services';
import { CalendarPicker } from 'antd-mobile';
import classnames from 'classnames';
import { CalendarOutline, RightOutline, LeftOutline } from 'antd-mobile-icons';
import { IZTDTStockInfo, ILongHuBang } from '@/types';

import './index.less';

interface IProps {
  latestWorkDay: string;
  latestDayZtList: IZTDTStockInfo[];
  latestDayDtList: IZTDTStockInfo[];
}

const dayFormatStr = 'YYYY-MM-DD';

export default (props: IProps) => {
  const { latestWorkDay, latestDayZtList, latestDayDtList } = props;
  const [matchLhbData, setMatchLhbData] = useState<{
    buySpLists: ILongHuBang[];
    postSpLists: ILongHuBang[];
    saleSpLists: ILongHuBang[];
  }>({
    buySpLists: [],
    postSpLists: [],
    saleSpLists: []
  });
  const [date, setDate] = useState(dayjs(latestWorkDay).format(dayFormatStr));
  const [matchSeq, setMatchSeq] = useState('712');
  const [calendarVisible, setCalendarVisible] = useState(false);

  const listRender = (desc: string, listData: any) => {
    if (!listData) return;
    return (
      <div className="list-warp">
        <div className="desc">{desc}</div>
        <div className="list-container">
          {listData.map((item: any, index: number) => {
            return (
              <div key={index} className="list-item">
                <div
                  className={classnames('stock-name', {
                    isZt: !!latestDayZtList.find(
                      (ztItem) => ztItem.name === item.stockName,
                    ),
                    isDt: !!latestDayDtList.find(
                      (dtItem) => dtItem.name === item.stockName,
                    ),
                  })}
                >
                  {item.stockName}
                </div>
                <div className="count-num">{item.countNum}人</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  useEffect(() => {
    getMatchBuyLongHuBang(date, matchSeq).then(setMatchLhbData);
  }, [date, matchSeq]);

  if (!matchLhbData) return null;

  return (
    <div className="match-lhb">
      <div className="title">
        <span
          className={matchSeq === '712' ? 'active' : 'normal'}
          onClick={() => setMatchSeq('712')}
        >
          淘股吧2024梦想杯百万赛
        </span>
        /
        <span
          className={matchSeq === '725' ? 'active' : 'normal'}
          onClick={() => setMatchSeq('725')}
        >
          王者百万杯
        </span>
        龙虎榜
      </div>
      <div className="date-container">
        <div
          className="pre"
          onClick={() => {
            setDate(dayjs(date).subtract(1, 'day').format(dayFormatStr));
          }}
        >
          <LeftOutline />
          上一日
        </div>
        <div className="date" onClick={() => setCalendarVisible(true)}>
          <CalendarOutline /> {date}
        </div>
        <div
          className="next"
          onClick={() => {
            setDate(dayjs(date).add(1, 'day').format(dayFormatStr));
          }}
        >
          下一日
          <RightOutline />
        </div>
      </div>
      <CalendarPicker
        visible={calendarVisible}
        selectionMode="single"
        value={new Date(date)}
        onChange={(val) => {
          setDate(dayjs(val).format(dayFormatStr));
        }}
        onClose={() => setCalendarVisible(false)}
        onMaskClick={() => setCalendarVisible(false)}
      />
      <div className="lhb-detail">
        {listRender('持仓', matchLhbData.postSpLists)}
        {listRender('买入', matchLhbData.buySpLists)}
        {listRender('卖出', matchLhbData.saleSpLists)}
      </div>
    </div>
  );
};
