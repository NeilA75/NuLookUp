"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNewsApiArticles = getNewsApiArticles;
const axios_1 = __importDefault(require("axios"));
const dateHelpers_1 = require("../../utils/dateHelpers");
async function getNewsApiArticles(query) {
    try {
        const apiKey = process.env.NEWS_API_KEY;
        if (!apiKey) {
            return [];
        }
        const response = await axios_1.default.get('https://newsapi.org/v2/everything', {
            params: {
                q: query,
                sortBy: 'publishedAt',
                pageSize: 10,
            },
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
            timeout: 20000,
        });
        const articles = response.data?.articles ?? [];
        return articles.map((item) => ({
            title: item.title || '',
            link: item.url || '',
            source: item.source?.name || 'NewsAPI',
            date: item.publishedAt ? (0, dateHelpers_1.formatDate)(item.publishedAt) : '',
            snippet: item.description || item.content || '',
            thumbnail: item.urlToImage || undefined,
        }));
    }
    catch (error) {
        console.error('getNewsApiArticles error', error);
        return [];
    }
}
