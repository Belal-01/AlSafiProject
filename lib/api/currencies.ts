import { z } from "zod";

export const currencySelect =
  "id, base_currency, target_currency, buy_price, sell_price, sort_order, is_visible";

const priceValueSchema = z.union([z.string().trim().min(1), z.number()]);

export const createCurrencySchema = z.object({
  base_currency: z.string().trim().min(1),
  target_currency: z.string().trim().min(1),
  buy_price: priceValueSchema,
  sell_price: priceValueSchema,
  sort_order: z.coerce.number().int().optional(),
  is_visible: z.coerce.boolean().optional(),
});

export const updateCurrencySchema = createCurrencySchema.partial();

export function normalizeCurrencyPayload<T extends Record<string, unknown>>(payload: T) {
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => {
      if (key === "buy_price" || key === "sell_price") {
        return [key, String(value)];
      }

      return [key, value];
    })
  );
}
