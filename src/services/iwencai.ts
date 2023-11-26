import axios from 'axios';

const request = axios.create({
  baseURL: 'https://www.iwencai.com', // 同花顺爱问财, https://www.iwencai.com/unifiedwap/result?w=%E6%9C%80%E8%BF%91%201%E4%B8%AA%E4%BA%A4%E6%98%93%E6%97%A5%E6%B6%A8%E5%81%9C%E8%82%A1%EF%BC%8C%E9%9D%9E%20st&querytype=stock&addSign=1701002289710
  timeout: 5000,
});

export async function getZDStocksByWenCai(date: string): Promise<any> {
  try {
    const res = await request('/customized/chart/get-robot-data', {
      method: 'post',
      headers: {
        'hexin-v': `A8JS1BuqE_x1zQ-iDlsV6bJ7FcMhk8UKeJq6YwzO76Hgfmx99CMWvUgnCtPf`, // 这个参数会过期..
      },
      data: {
        add_info:
          '{"urp":{"scene":1,"company":1,"business":1},"contentType":"json","searchInfo":true}',
        block_list: '',
        log_info: '{"input_type":"typewrite"}',
        page: 1,
        perpage: 100,
        query_area: '',
        question: `${date} 交易日涨停股，非 st`,
        secondary_intent: 'stock',
        source: 'Ths_iwencai_Xuangu',
        rsh: 'Ths_iwencai_Xuangu_du30iz05eymhykzk7yrh73u4gui5pb1h',
        version: '2.0',
      },
    });
    return (
      res?.data?.data?.answer?.[0]?.txt?.[0]?.content?.components?.[0]?.data
        ?.datas || []
    );
  } catch (error) {
    return [];
  }
}
