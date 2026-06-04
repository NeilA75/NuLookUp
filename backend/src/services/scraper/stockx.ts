import { getPage, closePage } from './scraperClient';
import { RawPricePoint } from '../../types/search';

function monthLabel(dateValue: number): string {
  return new Date(dateValue).toLocaleString('en-US', { month: 'short' });
}

export async function getStockxPrices(query: string): Promise<RawPricePoint[]> {
  const page = await getPage();
  try {
    const searchUrl = `https://stockx.com/search?s=${encodeURIComponent(query)}`;
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2500);

    const initialData = await page.evaluate(() => {
      const script = document.querySelector('script[id="__NEXT_DATA__"]');
      return script ? script.textContent : null;
    });

    if (!initialData) {
      return [];
    }

    const parsed = JSON.parse(initialData);
    const products = parsed?.props?.pageProps?.initialState?.products ?? parsed?.props?.pageProps?.products ?? [];
    if (!Array.isArray(products) || products.length === 0) {
      return [];
    }

    const firstProduct = products[0];
    const productUrl = firstProduct?.url || firstProduct?.productUrl;
    if (!productUrl) {
      return [];
    }

    await page.goto(`https://stockx.com${productUrl}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2500);

    const productData = await page.evaluate(() => {
      const script = document.querySelector('script[id="__NEXT_DATA__"]');
      return script ? script.textContent : null;
    });

    if (!productData) {
      return [];
    }

    const productParsed = JSON.parse(productData);
    const history = productParsed?.props?.pageProps?.product?.market?.priceHistory ?? productParsed?.props?.pageProps?.priceHistory ?? [];
    if (!Array.isArray(history)) {
      return [];
    }

    const trend = history
      .slice(-12)
      .map((entry: any) => ({
        month: monthLabel(entry?.date || entry?.time || 0),
        price: Number(entry?.price ?? entry?.amount ?? 0),
      }))
      .filter((point) => point.price > 0);

    return trend;
  } catch (error) {
    console.error('getStockxPrices error', error);
    return [];
  } finally {
    await closePage(page);
  }
}
