import { request } from '@/services/request';

export async function getZDStocks(date: string) {
  try {
    const res = await request(
      '/gateway/urp/v7/landing/getDataList',
      {
        method: 'post',
        data: {
          query: `${date} 交易日涨停股，非 st`,
          page: 1,
          perpage: 100,
          urp_sort_index: `连续涨停天数[${date}]`,
          ret: 'json_all',
          'date_range[0]': date,
          query_type: 'stock',
          comp_id: 6836372,
          business_cat: 'soniu',
          uuid: 24087,
        },
      },
    );
    return res;
  } catch (error) {
    return {};
  }
}
