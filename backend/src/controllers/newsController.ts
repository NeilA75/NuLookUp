import { Request, Response } from 'express';
import { getNewsArticles } from '../services/news/newsAggregator';

export async function newsController(req: Request, res: Response) {
  try {
    const query = String(req.query.q || '');
    const articles = await getNewsArticles(query);
    return res.json({ articles });
  } catch (error) {
    console.error('newsController error', error);
    return res.status(500).json({ articles: [] });
  }
}
