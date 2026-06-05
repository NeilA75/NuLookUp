"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newsController = newsController;
const newsAggregator_1 = require("../services/news/newsAggregator");
async function newsController(req, res) {
    try {
        const query = String(req.query.q || '');
        const articles = await (0, newsAggregator_1.getNewsArticles)(query);
        return res.json({ articles });
    }
    catch (error) {
        console.error('newsController error', error);
        return res.status(500).json({ articles: [] });
    }
}
