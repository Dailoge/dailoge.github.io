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