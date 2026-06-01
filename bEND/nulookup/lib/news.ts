export type NewsArticle = {
  id: string
  title: string
  source: string
  url: string
  summary: string
  category: string
  publishedAt: string
}

const SAMPLE_NEWS: NewsArticle[] = [
  {
    id: 'news-1',
    title: 'Sneaker resale prices surge after limited drop',
    source: 'Streetwear Daily',
    url: 'https://example.com/news/sneaker-resale-prices',
    summary: 'Limited edition releases are pushing resale values higher as collector demand remains strong.',
    category: 'Sneakers',
    publishedAt: '2026-06-01T08:00:00Z',
  },
  {
    id: 'news-2',
    title: 'Fashion brands lean into nostalgia for summer collabs',
    source: 'Style Pulse',
    url: 'https://example.com/news/fashion-nostalgia',
    summary: 'Brands are revisiting classic silhouettes and archival colorways for new collaboration drops.',
    category: 'Streetwear',
    publishedAt: '2026-06-01T05:30:00Z',
  },
]

export async function getLatestNews(): Promise<NewsArticle[]> {
  // Replace this with a real news API call or database query.
  return SAMPLE_NEWS
}

export async function getNewsByCategory(category: string): Promise<NewsArticle[]> {
  const news = await getLatestNews()
  return news.filter((article) => article.category.toLowerCase() === category.toLowerCase())
}
