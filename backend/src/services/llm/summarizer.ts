import OpenAI from 'openai';
import { AggregatedPriceData } from '../../types/search';
import { buildSummaryPrompt } from './promptBuilder';

export async function summarizeQuery(
  query: string,
  priceData: AggregatedPriceData,
  articleHeadlines: string[]
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const headlineSnippet = articleHeadlines.length
      ? `Recent headlines mention ${articleHeadlines.slice(0, 2).join('; ')}.`
      : 'No recent headlines are available.';

    return `Latest data for ${query} shows a current price of ${priceData.currentPrice}, a 12-month change of ${priceData.change}, and a range of ${priceData.low} to ${priceData.high}. ${headlineSnippet} Add OPENAI_API_KEY to .env to enable AI-generated summaries.`;
  }

  try {
    const client = new OpenAI({ apiKey });
    const prompt = buildSummaryPrompt(query, priceData, articleHeadlines);
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
      temperature: 0.3,
    });
    const content = response.choices?.[0]?.message?.content;
    return content?.trim() || 'Summary unavailable — AI response was empty.';
  } catch (error) {
    console.error('summarizeQuery error', error);
    return 'Summary unavailable — add OPENAI_API_KEY to .env to enable AI summaries.';
  }
}
