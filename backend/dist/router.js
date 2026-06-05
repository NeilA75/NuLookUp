"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const rateLimiter_1 = require("./utils/rateLimiter");
const searchController_1 = require("./controllers/searchController");
const newsController_1 = require("./controllers/newsController");
const summaryController_1 = require("./controllers/summaryController");
const router = express_1.default.Router();
const querySchema = zod_1.z.object({ q: zod_1.z.string().min(1) });
const summarySchema = zod_1.z.object({
    query: zod_1.z.string().min(1),
    priceData: zod_1.z.object({
        avgPrice: zod_1.z.string(),
        change: zod_1.z.string(),
        changePositive: zod_1.z.boolean(),
        low: zod_1.z.string(),
        high: zod_1.z.string(),
        trend: zod_1.z.array(zod_1.z.object({ day: zod_1.z.string(), price: zod_1.z.number() })),
    }),
    articles: zod_1.z.array(zod_1.z.object({
        title: zod_1.z.string(),
        link: zod_1.z.string(),
        source: zod_1.z.string(),
        date: zod_1.z.string(),
        snippet: zod_1.z.string(),
        thumbnail: zod_1.z.string().optional(),
    })),
});
function validateQuery(req, res, next) {
    const parsed = querySchema.safeParse({ q: req.query.q });
    if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid query parameter q' });
    }
    req.query.q = parsed.data.q;
    next();
}
function validateSummaryBody(req, res, next) {
    const parsed = summarySchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid summary payload' });
    }
    req.body = parsed.data;
    next();
}
router.use(rateLimiter_1.rateLimiter);
router.get('/search', validateQuery, searchController_1.searchController);
router.get('/news', validateQuery, newsController_1.newsController);
router.post('/summary', validateSummaryBody, summaryController_1.summaryController);
exports.default = router;
