export type TrendItem = {
  id: string
  label: string
  metric: number
  changePercent: number
  description: string
  category: string
}

const SAMPLE_TRENDS: TrendItem[] = [
  {
    id: 'trend-1',
    label: 'Retro Knit Sneakers',
    metric: 86,
    changePercent: 12,
    description: 'Search interest and resale demand are both rising for nostalgic knit sneaker styles.',
    category: 'Footwear',
  },
  {
    id: 'trend-2',
    label: 'Gradient Tech Jackets',
    metric: 73,
    changePercent: 8,
    description: 'Gradient finishes continue to appear in tech outerwear drops and influencer styling.',
    category: 'Outerwear',
  },
]

export async function getCurrentTrends(): Promise<TrendItem[]> {
  // Replace this with real trend analysis from analytics or market data.
  return SAMPLE_TRENDS
}

export function filterTrendsByCategory(category: string, trends: TrendItem[]): TrendItem[] {
  return trends.filter((trend) => trend.category.toLowerCase() === category.toLowerCase())
}
