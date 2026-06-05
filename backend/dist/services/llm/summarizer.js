"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.summarizeQuery = summarizeQuery;
const openai_1 = __importDefault(require("openai"));
const promptBuilder_1 = require("./promptBuilder");
async function summarizeQuery(query, priceData, articleHeadlines) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        return 'Summary unavailable — add OPENAI_API_KEY to .env to enable AI summaries.';
    }
    try {
        const client = new openai_1.default({ apiKey });
        const prompt = (0, promptBuilder_1.buildSummaryPrompt)(query, priceData, articleHeadlines);
        const response = await client.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 200,
            temperature: 0.3,
        });
        const content = response.choices?.[0]?.message?.content;
        return content?.trim() || 'Summary unavailable — AI response was empty.';
    }
    catch (error) {
        console.error('summarizeQuery error', error);
        return 'Summary unavailable — add OPENAI_API_KEY to .env to enable AI summaries.';
    }
}
