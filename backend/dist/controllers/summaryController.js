"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.summaryController = summaryController;
const summarizer_1 = require("../services/llm/summarizer");
async function summaryController(req, res) {
    try {
        const { query, priceData, articles } = req.body;
        const summary = await (0, summarizer_1.summarizeQuery)(query, priceData, articles.map((article) => article.title));
        return res.json({ summary });
    }
    catch (error) {
        console.error('summaryController error', error);
        return res.status(500).json({ summary: 'Summary unavailable due to server error.' });
    }
}
