"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCarPrices = getCarPrices;
const scraperClient_1 = require("../scraper/scraperClient");
function extractPrice(value) {
    if (!value) {
        return 0;
    }
    const cleaned = value.replace(/[^0-9.]/g, '');
    return Number(cleaned) || 0;
}
function formatMonth(date) {
    return date.toLocaleString('en-US', { month: 'short' });
}
async function getCarPrices(query) {
    const page = await (0, scraperClient_1.getPage)();
    try {
        const url = `https://www.cargurus.com/Cars/searchResults.action?zip=10001&searchText=${encodeURIComponent(query)}`;
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(2500);
        const listings = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('.cg-listing'))
                .map((element) => {
                const price = element.querySelector('.price')?.innerText || '';
                const date = element.querySelector('.listing-date')?.innerText || '';
                return { price, date };
            })
                .filter((entry) => entry.price);
        });
        const months = {};
        let total = 0;
        let count = 0;
        for (const listing of listings) {
            const price = extractPrice(listing.price);
            if (price <= 0) {
                continue;
            }
            const date = new Date(listing.date || '');
            const monthKey = Number.isNaN(date.getTime()) ? formatMonth(new Date()) : formatMonth(date);
            const bucket = months[monthKey] ?? { total: 0, count: 0 };
            bucket.total += price;
            bucket.count += 1;
            months[monthKey] = bucket;
            total += price;
            count += 1;
        }
        const average = count ? total / count : 0;
        const result = Object.entries(months).map(([month, bucket]) => ({
            month,
            price: bucket.total / bucket.count,
        }));
        if (result.length < 3) {
            const filled = [];
            const label = formatMonth(new Date());
            for (let i = 0; i < 12; i += 1) {
                const date = new Date();
                date.setMonth(date.getMonth() - (11 - i));
                filled.push({ month: formatMonth(date), price: average });
            }
            return filled;
        }
        return result.slice(0, 12);
    }
    catch (error) {
        console.error('getCarPrices error', error);
        return [];
    }
    finally {
        await (0, scraperClient_1.closePage)(page);
    }
}
