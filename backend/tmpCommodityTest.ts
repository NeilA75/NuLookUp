import { getCommodityPrices } from './src/services/priceSources/commodityPrice';

(async () => {
  try {
    const result = await getCommodityPrices('Silver');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Test failed', error);
  }
})();
