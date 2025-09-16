export type ProductID = 'BTC-USD' | 'ETH-USD' | 'XRP-USD' | 'LTC-USD';

export interface MatchMessage {
  type: 'match';
  trade_id: number;
  maker_order_id: string;
  taker_order_id: string;
  side: 'buy' | 'sell';
  size: string;
  price: string;
  product_id: ProductID;
  time: string;
}

export interface Level2Update {
  type: 'l2update';
  product_id: ProductID;
  changes: [string, string][];
}

export interface SystemStatus {
  channels: string[];
}
