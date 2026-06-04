import { Request, Response } from 'express';
import { summarizeQuery } from '../services/llm/summarizer';

export async function summaryController(req: Request, res: Response) {
  try {
    const { query, priceData, articles } = req.body;
    const summary = await summarizeQuery(query, priceData, articles.map((article: { title: string }) => article.title));
    return res.json({ summary });
  } catch (error) {
    console.error('summaryController error', error);
    return res.status(500).json({ summary: 'Summary unavailable due to server error.' });
  }
}
