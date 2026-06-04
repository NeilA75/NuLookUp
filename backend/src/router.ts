import express, { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { rateLimiter } from './utils/rateLimiter';
import { searchController } from './controllers/searchController';
import { newsController } from './controllers/newsController';
import { summaryController } from './controllers/summaryController';

const router = express.Router();

const querySchema = z.object({ q: z.string().min(1) });

const summarySchema = z.object({
  query: z.string().min(1),
  priceData: z.object({
    avgPrice: z.string(),
    change: z.string(),
    changePositive: z.boolean(),
    low: z.string(),
    high: z.string(),
    trend: z.array(z.object({ day: z.string(), price: z.number() })),
  }),
  articles: z.array(
    z.object({
      title: z.string(),
      link: z.string(),
      source: z.string(),
      date: z.string(),
      snippet: z.string(),
      thumbnail: z.string().optional(),
    })
  ),
});

function validateQuery(req: Request, res: Response, next: NextFunction) {
  const parsed = querySchema.safeParse({ q: req.query.q });
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid query parameter q' });
  }
  req.query.q = parsed.data.q;
  next();
}

function validateSummaryBody(req: Request, res: Response, next: NextFunction) {
  const parsed = summarySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid summary payload' });
  }
  req.body = parsed.data;
  next();
}

router.use(rateLimiter);
router.get('/search', validateQuery, searchController);
router.get('/news', validateQuery, newsController);
router.post('/summary', validateSummaryBody, summaryController);

export default router;
