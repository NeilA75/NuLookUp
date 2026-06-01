import { getLatestNews, NewsArticle } from './news'
import { getCurrentTrends, TrendItem } from './trends'

export type DashboardData = {
  news: NewsArticle[]
  trends: TrendItem[]
  summary: string
}

export async function buildDashboardData(): Promise<DashboardData> {
  const news = await getLatestNews()
  const trends = await getCurrentTrends()

  return {
    news,
    trends,
    summary: summarizeDashboard(news, trends),
  }
}

export function summarizeDashboard(news: NewsArticle[], trends: TrendItem[]): string {
  const newsCount = news.length
  const trendCount = trends.length

  return `Loaded ${newsCount} news article${newsCount === 1 ? '' : 's'} and ${trendCount} trend item${trendCount === 1 ? '' : 's'}.`
}

export function getTopTrend(trends: TrendItem[]): TrendItem | null {
  if (trends.length === 0) {
    return null
  }

  return trends.reduce((best, current) => (current.metric > best.metric ? current : best), trends[0])
}
