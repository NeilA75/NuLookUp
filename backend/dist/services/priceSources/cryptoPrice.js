"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCryptoPrices = getCryptoPrices;
const axios_1 = __importDefault(require("axios"));
const coinMap = {
    bitcoin: 'bitcoin',
    btc: 'bitcoin',
    ethereum: 'ethereum',
    eth: 'ethereum',
    sol: 'solana',
    solana: 'solana',
    doge: 'dogecoin',
    dogecoin: 'dogecoin',
    ada: 'cardano',
    cardano: 'cardano',
    bnb: 'binancecoin',
    litecoin: 'litecoin',
};
function normalizeCoinId(query) {
    const lower = query.trim().toLowerCase();
    const directMatch = coinMap[lower];
    if (directMatch) {
        return directMatch;
    }
    const token = lower.split(' ')[0];
    return coinMap[token] ?? token;
}
async function getCryptoPrices(query) {
    try {
        const id = normalizeCoinId(query);
        const response = await axios_1.default.get(`https://api.coingecko.com/api/v3/coins/${encodeURIComponent(id)}/market_chart`, {
            params: {
                vs_currency: 'usd',
                days: 'max',
                interval: 'monthly',
            },
            timeout: 20000,
        });
        const prices = response.data?.prices ?? [];
        const trend = prices
            .map((row) => ({
            month: new Date(row[0]).toLocaleString('en-US', { month: 'short' }),
            price: Number(row[1] ?? 0),
            date: new Date(row[0]).toISOString(),
        }));
        return trend;
    }
    catch (error) {
        console.error('getCryptoPrices error', error);
        return [];
    }
}
