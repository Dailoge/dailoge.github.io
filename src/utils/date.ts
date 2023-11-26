import dayjs from 'dayjs';


export function isWeekday(date: dayjs.Dayjs) {  
  const dayOfWeek = date.day();  
  return dayOfWeek >= 1 && dayOfWeek <= 5; // 周一到周五是工作日  
}  
  
export function getRecentWorkdays(count: number) {  
  const today = dayjs();  
  const workdays = [];  
  let i = 0;
  
  while(true) {
    let currentDate = today.subtract(i++, 'day');  
    if(isWeekday(currentDate)){
      workdays.push(currentDate.format('YYYY-MM-DD'));
    }
    if(workdays.length === count) {
      break;
    }
  }
  
  return workdays;  
}