"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSummaryPrompt = buildSummaryPrompt;
function buildSummaryPrompt(query, priceData, articleHeadlines) {
    const headlines = articleHeadlines.length ? articleHeadlines.join('\n- ') : 'None available';
    return `You are a financial and market analyst. Given the following data about "${query}":
- Current average price: ${priceData.avgPrice}
- 12-month change: ${priceData.change}
- Price range: ${priceData.low} – ${priceData.high}
- Recent headlines:
- ${headlines}

Write a 3-sentence factual summary of what this item is, its current market position, and what is driving its price. Be concise and neutral. Do not use bullet points.`;
}
