"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCollectablePrices = getCollectablePrices;
const ebay_1 = require("../scraper/ebay");
const stockx_1 = require("../scraper/stockx");
const dateHelpers_1 = require("../../utils/dateHelpers");
async function getCollectablePrices(query) {
    try {
        const ebayData = await (0, ebay_1.getEbayPrices)(query);
        const stockxData = await (0, stockx_1.getStockxPrices)(query);
        const combined = [...ebayData, ...stockxData];
        const monthMap = new Map();
        for (const point of combined) {
            const existing = monthMap.get(point.month);
            if (existing === undefined || point.price > existing) {
                monthMap.set(point.month, point.price);
            }
        }
        const months = (0, dateHelpers_1.getTrailing12Months)();
        const result = months.map((month) => ({
            month,
            price: monthMap.get(month) ?? 0,
        }));
        return result;
    }
    catch (error) {
        console.error('getCollectablePrices error', error);
        return [];
    }
}
