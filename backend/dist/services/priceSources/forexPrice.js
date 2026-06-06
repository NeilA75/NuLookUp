"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getForexPrices = getForexPrices;
const axios_1 = __importDefault(require("axios"));
const dateHelpers_1 = require("../../utils/dateHelpers");
function parseCurrencyPair(query) {
    const normalized = query.trim().toUpperCase();
    const pairMatch = normalized.match(/([A-Z]{3})\/?([A-Z]{3})/);
    if (pairMatch) {
        return { base: pairMatch[1], target: pairMatch[2] };
    }
    return null;
}
function buildMonthlyPoints(rates, months) {
    const entries = Object.entries(rates)
        .map(([date, value]) => ({
        month: new Date(date).toLocaleString('en-US', { month: 'short' }),
        price: value,
        date: new Date(date).toISOString(),
    }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    if (entries.length >= 12) {
        return entries.slice(-12);
    }
    const result = [];
    const lastPrice = entries[entries.length - 1]?.price ?? 0;
    for (let i = 0; i < 12; i += 1) {
        result.push({ month: months[i], price: entries[i]?.price ?? lastPrice });
    }
    return result;
}
async function getForexPrices(query) {
    try {
        const pair = parseCurrencyPair(query);
        if (!pair) {
            return [];
        }
        const endDate = new Date();
        const startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 11, 1);
        const startIso = startDate.toISOString().slice(0, 10);
        const endIso = endDate.toISOString().slice(0, 10);
        const months = (0, dateHelpers_1.getTrailing12Months)();
        const apiKey = process.env.FIXER_API_KEY;
        let data = null;
        if (apiKey) {
            try {
                const response = await axios_1.default.get('http://data.fixer.io/api/timeseries', {
                    params: {
                        access_key: apiKey,
                        start_date: startIso,
                        end_date: endIso,
                        base: pair.base,
                        symbols: pair.target,
                    },
                    timeout: 20000,
                });
                data = response.data;
            }
            catch (fixerError) {
                console.error('Fixer API error', fixerError);
            }
        }
        if (!data || !data.rates) {
            const response = await axios_1.default.get('https://api.exchangerate.host/timeseries', {
                params: {
                    start_date: startIso,
                    end_date: endIso,
                    base: pair.base,
                    symbols: pair.target,
                },
                timeout: 20000,
            });
            data = response.data;
        }
        if (!data?.rates) {
            return [];
        }
        const latestRates = {};
        for (const [date, values] of Object.entries(data.rates)) {
            const value = values[pair.target];
            if (typeof value === 'number') {
                latestRates[date] = value;
            }
        }
        return buildMonthlyPoints(latestRates, months);
    }
    catch (error) {
        console.error('getForexPrices error', error);
        return [];
    }
}
