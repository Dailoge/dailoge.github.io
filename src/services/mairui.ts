import axios from 'axios';

const request = axios.create({
  baseURL: 'https://www.iwencai.com', // 麦蕊，https://www.mairui.club/Inquiry.aspx
  timeout: 5000,
});

interface IStockInfo {
  dm: string; //代码
  mc: string; //名称
  p: number; //价格（元）
  zf: number; //跌幅（%）
  cje: number; //成交额（元）
  lt: number; //流通市值（元）
  zsz: number; //总市值（元）
  pe: number; //动态市盈率
  hs: number; //换手率（%）
  lbc: number; //连续跌停次数
  lbt: string; //最后封板时间（HH:mm:ss）
  zj: number; //封单资金（元）
  fba: number; //板上成交额（元）
  zbc: number; //开板次数
}

// 每个种子有 50 次的免费调用次数限制，超过会报错
const seeksId = `
32dacd384d8974c05b
0417e17909389f602
d0579b3750d1622c7
96b5b5976409b1c3b
c09d316334a350c3a
6c1f11f31572779359
20c18fd550363838ca
02e129502560a0f5dd
26aba146ae31c5a4f3
`;

function getSeekId() {
  const seekIdList = seeksId.trim().split('\n');
  const random = Math.round(Math.random() * seekIdList.length);
  return seekIdList[random] || '32dacd384d8974c05b';
}

/**
 *
 * @export
 * @param {string} date, ex: 2023-11-24
 * @return {*}  {Promise<IStockInfo[]>}
 */
export async function getZDStocksByMaiRui(date: string): Promise<IStockInfo[]> {
  try {
    // @ts-ignore
    const query = async () => {
      const res: IStockInfo[] = await request.get(
        `https://api.mairui.club/hslt/ztgc/${date}/${getSeekId()}`, {
          withCredentials: false,
        }
      );
      if (Array.isArray(res) || res === null) {
        return res;
      } else {
        return query();
      }
    };
    return await query();
  } catch (error) {
    return [];
  }
}
