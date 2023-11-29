import dayjs from 'dayjs';

export function isWeekday(date: dayjs.Dayjs) {
  const dayOfWeek = date.day();
  return dayOfWeek >= 1 && dayOfWeek <= 5; // 周一到周五是工作日
}

export function getRecentWorkdays(count: number) {
  const today = dayjs();
  const workdays = [];
  let i = 0;

  while (true) {
    let currentDate = today.subtract(i, 'day');
    if (isWeekday(currentDate)) {
      if (i === 0) {
        // 9点30 开市 
        const currentStockBeginTime = today.clone().set('hour', 8).set('minute', 29);
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
