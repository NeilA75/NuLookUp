import { ItemCategory } from '../types/sources';

const stockKeywords = /\b(stock|share|equity|ticker|ipo|corp|inc|ltd|company)\b/i;
const cryptoKeywords = /\b(bitcoin|ethereum|crypto|coin|token|btc|eth|sol|bnb|ada|doge)\b/i;
const forexKeywords = /\b(exchange rate|forex|currency pair|currency)\b|\b[A-Z]{3}\/[A-Z]{3}\b/;
const commodityKeywords = /\b(gold|silver|oil|wheat|crude|copper|corn|soybean|futures)\b/i;
const carKeywords = /\b(sedan|truck|suv|coupe|convertible|hatchback|toyota|honda|ford|chevrolet|bmw|mercedes|audi|tesla|nissan|subaru|volkswagen|jeep)\b/i;
const clothingKeywords = /\b(nike|adidas|supreme|sneaker|shoe|jacket|jersey|hoodie|tshirt|sweater|pants|jeans)\b/i;
const collectableKeywords = /\b(trading card|pokemon|psa|graded|comic|watch|rolex|collectible|collectable|funko|nft)\b/i;

export function classifyQuery(query: string): ItemCategory {
  const normalized = query.trim();
  const uppercase = normalized.toUpperCase();

  if (cryptoKeywords.test(normalized)) {
    return ItemCategory.CRYPTO;
  }

  if (forexKeywords.test(uppercase)) {
    return ItemCategory.FOREX;
  }

  if (commodityKeywords.test(normalized)) {
    return ItemCategory.COMMODITY;
  }

  if (carKeywords.test(normalized)) {
    return ItemCategory.CAR;
  }

  if (clothingKeywords.test(normalized)) {
    return ItemCategory.CLOTHING;
  }

  if (collectableKeywords.test(normalized)) {
    return ItemCategory.COLLECTABLE;
  }

  if (stockKeywords.test(normalized)) {
    return ItemCategory.STOCK;
  }

  if (/^[A-Z]{1,5}$/.test(uppercase) || /\b[A-Z]{1,5}\b/.test(uppercase)) {
    return ItemCategory.STOCK;
  }

  return ItemCategory.GENERAL;
}
