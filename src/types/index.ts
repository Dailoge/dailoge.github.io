export interface IZTDTStockInfo {
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
