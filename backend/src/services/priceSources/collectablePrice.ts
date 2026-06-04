import { getEbayPrices } from '../scraper/ebay';
import { getStockxPrices } from '../scraper/stockx';
import { getTrailing12Months } from '../../utils/dateHelpers';
import { RawPricePoint } from '../../types/search';

export async function getCollectablePrices(query: string): Promise<RawPricePoint[]> {
  try {
    const ebayData = await getEbayPrices(query);
    const stockxData = await getStockxPrices(query);
    const combined = [...ebayData, ...stockxData];
    const monthMap = new Map<string, number>();

    for (const point of combined) {
      const existing = monthMap.get(point.month);
      if (existing === undefined || point.price > existing) {
        monthMap.set(point.month, point.price);
      }
    }

    const months = getTrailing12Months();
    const result: RawPricePoint[] = months.map((month) => ({
      month,
      price: monthMap.get(month) ?? 0,
    }));

    return result;
  } catch (error) {
    console.error('getCollectablePrices error', error);
    return [];
  }
}
