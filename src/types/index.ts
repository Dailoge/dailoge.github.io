export interface IZTDTStockInfo {
  code: string; // 代码
  name: string; // 名称
  price: number; // 价格（元）
  zdf: number; // 涨跌幅（%）
  cje: number; // 成交额（元）
  ltsz: number; // 流通市值（元）
  hs: number; // 换手率（%）
  lbc: number; // 连续涨停次数
  fbt: string; // 第一次封板时间（HH:mm:ss）
  lbt: string; // 最后封板时间（HH:mm:ss）
  zj: number; // 封单资金（元）
  kbcs: number; // 开板次数
}

export interface IDateStock {
  date: string;
  ztList: IZTDTStockInfo[];
  dtList: IZTDTStockInfo[];
}

export interface IJianGuanStock {
  name: string;
  code: string;
  date: string;
  link: string;
}

export interface IStockBlockUp {
  change: number; // 涨幅
  code: string; // 板块 code
  continuous_plate_num: number; // 连板家数
  days: number; // 上榜天数
  high: string; // 连板高度
  high_num: number; // 不知道啥东西
  limit_up_num: number; // 涨停家数
  name: string; // 板块中文名
  stock_list: Array<{
    code: string; // 股票 code
    continue_num: number; // 涨停高度
    high: string; // 连板高度
    name: string; // 股票名称
    reason_info: string; // 涨停理由
    reason_type: string; // 涨停概念
  }>;
}
