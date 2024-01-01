import dayjs from 'dayjs';
// 2024 年
const legalHolidays = [
  ['01.01', '01.01'], // 元旦节
  ['02.10', '02.17'], // 春节
  ['04.04', '04.06'], // 清明节
  ['05.01', '05.05'], // 劳动节
  ['06.08', '06.10'], // 端午节
  ['09.15', '09.17'], // 中秋节
  ['10.01', '10.07'], // 国庆节
];

export function isWeekday(date: dayjs.Dayjs) {
  const dayOfWeek = date.day();
  return dayOfWeek >= 1 && dayOfWeek <= 5; // 周一到周五是工作日
}

export function isLegalHoliday(date: dayjs.Dayjs) {
  const findRes = legalHolidays.find(([startDay, endDay]) => {
    const startDayIns = dayjs(`${date.format('YYYY')}.${startDay}`);
    const endDayIns = dayjs(`${date.format('YYYY')}.${endDay}`)
      .set('hour', 23)
      .set('minute', 59)
      .set('millisecond', 59);
    return (
      (date.isAfter(startDayIns) && date.isBefore(endDayIns)) ||
      date.isSame(startDayIns) ||
      date.isSame(endDayIns)
    );
  });
  return !!findRes;
}

export function getRecentWorkdays(count: number) {
  const today = dayjs();
  const workdays: string[] = [];
  let i = 0;

  while (true) {
    let currentDate = today.subtract(i, 'day');
    if (isWeekday(currentDate) && !isLegalHoliday(currentDate)) {
      if (i === 0) {
        // 9点30 开市
        const currentStockBeginTime = today
          .clone()
          .set('hour', 8)
          .set('minute', 29);
        if (currentDate.isAfter(currentStockBeginTime)) {
          workdays.push(currentDate.format('YYYY-MM-DD'));
        }
      } else {
        workdays.push(currentDate.format('YYYY-MM-DD'));
      }
    }
    if (workdays.length === count) {
      break;
    }
    i++;
  }

  return workdays;
}
