"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aggregatePrices = aggregatePrices;
const dateHelpers_1 = require("../utils/dateHelpers");
function formatCurrency(price) {
    return `$${price.toFixed(2)}`;
}
function formatChange(value) {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}
function buildTrend(rawPrices) {
    const months = (0, dateHelpers_1.getTrailing12Months)();
    const trend = [];
    if (rawPrices.length === 0) {
        return months.map((month) => ({ day: month, price: 0 }));
    }
    const prices = rawPrices.slice(0, 12).map((point) => point.price);
    const lastPrice = prices[prices.length - 1] ?? 0;
    const filledPrices = [...prices];
    while (filledPrices.length < 12) {
        filledPrices.push(filledPrices[filledPrices.length - 1] ?? lastPrice);
    }
    for (let index = 0; index < 12; index += 1) {
        trend.push({ day: months[index], price: filledPrices[index] ?? lastPrice });
    }
    return trend;
}
function aggregatePrices(rawPrices) {
    const prices = rawPrices.map((point) => point.price).filter((price) => Number.isFinite(price));
    const trend = buildTrend(rawPrices);
    const firstPrice = prices[0] ?? trend[0].price;
    const lastPrice = prices[prices.length - 1] ?? trend[trend.length - 1].price;
    const avgPrice = prices.length ? prices.reduce((sum, value) => sum + value, 0) / prices.length : 0;
    const lowPrice = prices.length ? Math.min(...prices) : 0;
    const highPrice = prices.length ? Math.max(...prices) : 0;
    const change = firstPrice > 0 ? ((lastPrice - firstPrice) / firstPrice) * 100 : 0;
    return {
        avgPrice: formatCurrency(avgPrice),
        change: formatChange(change),
        changePositive: change >= 0,
        low: formatCurrency(lowPrice),
        high: formatCurrency(highPrice),
        trend,
    };
}
