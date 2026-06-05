export interface RawPricePoint {
  month: string;
  price: number;
  date?: string;
}

export interface AggregatedPriceData {
  avgPrice: string;
  currentPrice: string;
  change: string;
  changePositive: boolean;
  low: string;
  high: string;
  trend: { day: string; price: number; date?: string }[];
}

export interface Article {
  title: string;
  link: string;
  source: string;
  date: string;
  snippet: string;
  thumbnail?: string;
}

export interface SearchResult {
  query: string;
  category: string;
  avgPrice: string;
  change: string;
  changePositive: boolean;
  low: string;
  high: string;
  currentPrice: string;
  trend: { day: string; price: number; date?: string }[];
  summary: string;
  articles: Article[];
}
