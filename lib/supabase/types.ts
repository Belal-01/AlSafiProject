export type Currency = {
  id: string;
  base_currency: string;
  target_currency: string;
  buy_price: string;
  sell_price: string;
  sort_order: number;
  is_visible: boolean;
};

export type Settings = {
  ticker_text: string;
};
