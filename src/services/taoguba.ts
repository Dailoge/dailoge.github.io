import request from './request';
import dayjs from 'dayjs';



// 底层调用淘股吧 api，https://www.taoguba.com.cn/spmatch/matchAll?tid=5580086
/**
 * @desc 获取涨跌停个数，但是有 10 分钟的延迟
 * @export
 * @param {string} date, ex: 20240426
 * @param {string} spMatchSeq, ex: 725
 */
export async function getMatchBuyLongHuBang(date: string, spMatchSeq: string){
  const defaultRes = {
    buySpLists: [],
    postSplists: [],
    saleSplists: []
  };
  try {
    const adapterDate = dayjs(date).format('YYYYMMDD');
    const requestAdapter = () => request(`/getMatchBuyLongHuBang?date=${adapterDate}&spMatchSeq=${spMatchSeq}`);
    // 因为是 serverless，服务重启要时间，这里支持二次重试
    const response = await requestAdapter().catch(requestAdapter);
    return response?.data?.data || defaultRes;
  } catch (error) {
    console.error(error);
    return defaultRes;
  }
}
