"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStockPrices = getStockPrices;
const axios_1 = __importDefault(require("axios"));
const scraperClient_1 = require("../scraper/scraperClient");
function monthLabelFromDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    return date.toLocaleString('en-US', { month: 'short' });
}
function parseMonthlySeries(data) {
    const series = data?.['Monthly Time Series'] ?? data?.['Monthly Adjusted Time Series'];
    if (!series || typeof series !== 'object') {
        return [];
    }
    return Object.entries(series)
        .slice(0, 12)
        .map(([month, values]) => ({
        month: monthLabelFromDate(month),
        price: Number(values['4. close'] ?? 0),
    }))
        .reverse();
}
async function scrapeYahooFinance(symbol) {
    const page = await (0, scraperClient_1.getPage)();
    const url = `https://finance.yahoo.com/quote/${encodeURIComponent(symbol)}/history?p=${encodeURIComponent(symbol)}`;
    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(2500);
        const jsonData = await page.evaluate(() => {
            const script = Array.from(document.querySelectorAll('script')).find((node) => node.textContent?.includes('HistoricalPriceStore'));
            if (!script) {
                return null;
            }
            const text = script.textContent || '';
            const match = text.match(/"HistoricalPriceStore":(\{.*?\}),"currentPrice"/s);
            return match ? match[1] : null;
        });
        if (!jsonData) {
            return [];
        }
        const parsed = JSON.parse(jsonData);
        const prices = parsed.prices ?? [];
        const labels = new Map();
        for (const row of prices) {
            if (!row || typeof row.date !== 'number' || typeof row.close !== 'number') {
                continue;
            }
            const month = new Date(row.date * 1000).toLocaleString('en-US', { month: 'short' });
            const entry = labels.get(month) ?? { total: 0, count: 0 };
            entry.total += row.close;
            entry.count += 1;
            labels.set(month, entry);
        }
        return Array.from(labels.entries())
            .slice(0, 12)
            .map(([month, entry]) => ({ month, price: entry.total / entry.count }));
    }
    catch (error) {
        console.error('Yahoo Finance scrape failed', error);
        return [];
    }
    finally {
        await (0, scraperClient_1.closePage)(page);
    }
}
async function getStockPrices(query) {
    try {
        const symbol = query.trim().split(' ')[0].toUpperCase();
        const apiKey = process.env.ALPHA_VANTAGE_KEY;
        if (apiKey) {
            try {
                const response = await axios_1.default.get('https://www.alphavantage.co/query', {
                    params: {
                        function: 'TIME_SERIES_MONTHLY',
                        symbol,
                        apikey: apiKey,
                    },
                });
                const data = parseMonthlySeries(response.data);
                if (data.length >= 3) {
                    return data;
                }
            }
            catch (apiError) {
                console.error('Alpha Vantage stock price fetch failed', apiError);
            }
        }
        return await scrapeYahooFinance(symbol);
    }
    catch (error) {
        console.error('getStockPrices error', error);
        return [];
    }
}
