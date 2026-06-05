"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNewsArticles = getNewsArticles;
const newsApi_1 = require("./newsApi");
const newsScrapers_1 = require("../scraper/newsScrapers");
function dedupeArticles(articles) {
    const titles = new Set();
    return articles.filter((article) => {
        const key = article.title.toLowerCase().trim();
        if (!key || titles.has(key)) {
            return false;
        }
        titles.add(key);
        return true;
    });
}
function sortArticles(articles) {
    return articles.slice().sort((a, b) => {
        const aTime = new Date(a.date).getTime() || 0;
        const bTime = new Date(b.date).getTime() || 0;
        return bTime - aTime;
    });
}
async function getNewsArticles(query) {
    try {
        const primary = await (0, newsApi_1.getNewsApiArticles)(query);
        const articles = [...primary];
        if (articles.length < 5) {
            const supplemental = await (0, newsScrapers_1.getScrapedNews)(query);
            articles.push(...supplemental);
        }
        const deduped = dedupeArticles(articles);
        return sortArticles(deduped).slice(0, 10);
    }
    catch (error) {
        console.error('getNewsArticles error', error);
        return [];
    }
}
