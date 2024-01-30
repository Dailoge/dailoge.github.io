import request from './request';
import { IJianGuanStock } from '@/types';

/** 证监会，底层调用上交所、深交所的能力
 * 1、深交所：https://www.szse.cn/disclosure/supervision/inquire/index.html
 * 2、上交所：http://www.sse.com.cn/disclosure/credibility/supervision/measures/
 */

/**
 * @desc 通过证监会 接口获取数据
 * @export
 */
export async function getJianGuanStock(): Promise<IJianGuanStock[]> {
  try {
    const requestAdapter = () => request(`/getJianGuanStock`);
    const res = await requestAdapter().catch(requestAdapter);
    const { shanghai, shenzhen } = res.data.data;
    const list: IJianGuanStock[] = [];
    shanghai.result.forEach((item: any) => {
      list.push({
        code: item.stockcode,
        name: item.extGSJC,
        date: item.createTime,
        link: 'http://' + item.docURL,
      });
    });
    shenzhen[0].data.forEach((item: any) => {
      const reg = /encode-open='(.*?)'/gim;
      const path = reg.exec(item.ck)?.[1] || '';
      const link = path ? 'https://reportdocs.static.szse.cn/' + path : '';
      list.push({
        code: item.gsdm,
        name: item.gsjc,
        date: item.fhrq,
        link,
      });
    })
    return list;
  } catch (error) {
    console.error(error);
    return [];
  }
}
