import axios from 'axios';

const request = axios.create({
  baseURL: 'https://service-fxf0odwp-1252010818.sh.apigw.tencentcs.com', // 腾讯云 serverless，底层调用必盈 api，https://www.biyingapi.com/serve.html
  timeout: 5000,
});

export interface IStockInfo {
  dm: string; //代码
  mc: string; //名称
  p: number; //价格（元）
  zf: number; //跌幅（%）
  cje: number; //成交额（元）
  lt: number; //流通市值（元）
  zsz: number; //总市值（元）
  pe: number; //动态市盈率
  hs: number; //换手率（%）
  lbc: number; //连续涨停/跌停次数
  lbt: string; //最后封板时间（HH:mm:ss）
  zj: number; //封单资金（元）
  fba: number; //板上成交额（元）
  zbc: number; //开板次数
}

/**
 *
 * @export
 * @param {string} date, ex: 2023-11-24
 * @return {*}  {Promise<IStockInfo[]>}
 */
export async function getZTStocksByBiYing(date: string): Promise<{
  ztList: IStockInfo[],
  dtList: IStockInfo[]
}> {
  try {
    const res = await request(
      `/release/zt-dt?date=${date}`,
    );
    return res?.data?.data;
  } catch (error) {
    console.error(error);
    return {
      ztList: [],
      dtList: [],
    };
  }
}
