"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommodityPrices = getCommodityPrices;
const axios_1 = __importDefault(require("axios"));
const commodityLookup = {
    wti: { symbol: 'CL=F', name: 'WTI' },
    brent: { symbol: 'BZ=F', name: 'BRENT' },
    gold: { symbol: 'GC=F', name: 'GOLD_PRICE' },
    silver: { symbol: 'SI=F', name: 'SILVER' },
    wheat: { symbol: 'ZW=F', name: 'WHEAT' },
    copper: { symbol: 'HG=F', name: 'COPPER' },
};
function resolveSymbol(query) {
    const normalized = query.trim().toLowerCase();
    if (normalized.includes('brent')) {
        return commodityLookup.brent.symbol;
    }
    if (normalized.includes('wti')) {
        return commodityLookup.wti.symbol;
    }
    if (normalized.includes('gold')) {
        return commodityLookup.gold.symbol;
    }
    if (normalized.includes('silver')) {
        return commodityLookup.silver.symbol;
    }
    if (normalized.includes('wheat')) {
        return commodityLookup.wheat.symbol;
    }
    if (normalized.includes('copper')) {
        return commodityLookup.copper.symbol;
    }
    return Object.values(commodityLookup)[0].symbol;
}
function monthLabel(dateString) {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
        return dateString;
    }
    return date.toLocaleString('en-US', { month: 'short' });
}
async function getCommodityPrices(query) {
    try {
        const apiKey = process.env.ALPHA_VANTAGE_KEY;
        const symbol = resolveSymbol(query);
        if (!apiKey) {
            return [];
        }
        const response = await axios_1.default.get('https://www.alphavantage.co/query', {
            params: {
                function: 'TIME_SERIES_MONTHLY',
                symbol,
                apikey: apiKey,
            },
            timeout: 20000,
        });
        const data = response.data?.['Monthly Time Series'] ?? response.data?.['Monthly Adjusted Time Series'];
        if (!data || typeof data !== 'object') {
            return [];
        }
        return Object.entries(data)
            .slice(0, 12)
            .map(([date, values]) => ({
            month: monthLabel(date),
            price: Number(values['4. close'] ?? 0),
        }))
            .reverse();
    }
    catch (error) {
        console.error('getCommodityPrices error', error);
        return [];
    }
}
