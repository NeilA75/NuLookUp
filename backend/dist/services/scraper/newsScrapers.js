"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScrapedNews = getScrapedNews;
const scraperClient_1 = require("./scraperClient");
async function getScrapedNews(query) {
    const page = await (0, scraperClient_1.getPage)();
    try {
        const url = `https://news.google.com/search?q=${encodeURIComponent(query)}`;
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(2500);
        const articles = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('article'))
                .slice(0, 10)
                .map((article) => {
                const title = article.querySelector('h3')?.innerText || '';
                const source = article.querySelector('.SVJrMe')?.innerText || '';
                const linkElement = article.querySelector('a[href]');
                const relativeDate = article.querySelector('time')?.getAttribute('datetime') || article.querySelector('time')?.innerText || '';
                const snippet = article.querySelector('.xBbh9')?.innerText || '';
                const href = linkElement ? linkElement.getAttribute('href') || '' : '';
                const link = href.startsWith('./') ? `https://news.google.com${href.slice(1)}` : href;
                return {
                    title,
                    source,
                    date: relativeDate,
                    link,
                    snippet,
                };
            })
                .filter((item) => item.title && item.link);
        });
        return articles;
    }
    catch (error) {
        console.error('getScrapedNews error', error);
        return [];
    }
    finally {
        await (0, scraperClient_1.closePage)(page);
    }
}
