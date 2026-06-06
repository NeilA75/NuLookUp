"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommodityPrices = getCommodityPrices;
const axios_1 = __importDefault(require("axios"));
const fs_1 = require("fs");
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
function debugLog(message) {
    try {
        (0, fs_1.appendFileSync)('commodity-debug.log', `${new Date().toISOString()} ${message}\n`);
    }
    catch (error) {
        console.error('Failed to write debug log', error);
    }
}
function parseYahooChart(data) {
    const result = [];
    const chart = data?.chart?.result?.[0];
    const timestamps = chart?.timestamp ?? [];
    const closePrices = chart?.indicators?.quote?.[0]?.close ?? [];
    for (let i = 0; i < timestamps.length; i += 1) {
        const timestamp = timestamps[i];
        const price = Number(closePrices[i]);
        if (!timestamp || Number.isNaN(price) || price <= 0)
            continue;
        const isoDate = new Date(timestamp * 1000).toISOString();
        result.push({ month: monthLabel(isoDate), price, date: isoDate });
    }
    return result;
}
async function fetchYahooCommodityChart(symbol) {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=max&interval=1mo`;
    try {
        const response = await axios_1.default.get(url, { timeout: 20000 });
        return parseYahooChart(response.data);
    }
    catch (error) {
        console.error('Yahoo commodity chart fetch failed', error);
        return [];
    }
}
function parseYahooCsv(csv) {
    const lines = csv.trim().split('\n');
    const rows = lines.slice(1);
    const monthly = [];
    for (const line of rows) {
        const parts = line.split(',');
        if (parts.length < 6)
            continue;
        const [date, , , , close] = parts;
        const price = Number(close);
        if (Number.isNaN(price) || price <= 0)
            continue;
        monthly.push({ month: monthLabel(date), price, date: new Date(date).toISOString() });
    }
    return monthly.slice(-12);
}
async function fetchYahooCommodityCsv(symbol) {
    const endDate = Math.floor(Date.now() / 1000);
    const startDate = Math.floor(new Date(new Date().setMonth(new Date().getMonth() - 12)).getTime() / 1000);
    const url = `https://query1.finance.yahoo.com/v7/finance/download/${encodeURIComponent(symbol)}?period1=${startDate}&period2=${endDate}&interval=1mo&events=history&includeAdjustedClose=true`;
    try {
        const response = await axios_1.default.get(url, { timeout: 20000, responseType: 'text' });
        if (typeof response.data !== 'string') {
            return [];
        }
        return parseYahooCsv(response.data);
    }
    catch (error) {
        console.error('Yahoo commodity CSV fetch failed', error);
        return [];
    }
}
async function getCommodityPrices(query) {
    try {
        const symbol = resolveSymbol(query);
        const apiKey = process.env.ALPHA_VANTAGE_KEY;
        if (apiKey) {
            try {
                const response = await axios_1.default.get('https://www.alphavantage.co/query', {
                    params: {
                        function: 'TIME_SERIES_MONTHLY',
                        symbol,
                        apikey: apiKey,
                    },
                    timeout: 20000,
                });
                const data = response.data?.['Monthly Time Series'] ?? response.data?.['Monthly Adjusted Time Series'];
                if (data && typeof data === 'object') {
                    const result = Object.entries(data)
                        .map(([date, values]) => ({
                        month: monthLabel(date),
                        price: Number(values['4. close'] ?? 0),
                        date: new Date(date).toISOString(),
                    }))
                        .reverse();
                    if (result.length > 0 && result.some((point) => point.price > 0)) {
                        return result;
                    }
                }
            }
            catch (apiError) {
                console.error('Alpha Vantage commodity fetch failed', apiError);
            }
        }
        const chartResult = await fetchYahooCommodityChart(symbol);
        if (chartResult.length > 0) {
            debugLog(`symbol=${symbol} chartResultCount=${chartResult.length} result=${JSON.stringify(chartResult.slice(0, 5))}`);
            return chartResult;
        }
        const csvResult = await fetchYahooCommodityCsv(symbol);
        debugLog(`symbol=${symbol} csvResultCount=${csvResult.length} result=${JSON.stringify(csvResult.slice(0, 5))}`);
        return csvResult;
    }
    catch (error) {
        console.error('getCommodityPrices error', error);
        debugLog(`getCommodityPrices error=${String(error)}`);
        return [];
    }
}
