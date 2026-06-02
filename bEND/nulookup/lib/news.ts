import dotenv from "dotenv";
dotenv.config();

export interface NewsArticle {
  title: string;
  link: string;
  source: string;
  date: string;
  snippet: string;
  thumbnail?: string;
}

export async function getNews(searchText: string): Promise<{ search: string; articles: NewsArticle[] }> {
  const apiKey = process.env.NEWS_API_KEY;
  console.log("Searching:", searchText);

  const params = new URLSearchParams({
    q: searchText,
    apiKey: apiKey!,
    language: "en",
    sortBy: "publishedAt",
  });

  const res = await fetch(`https://newsapi.org/v2/everything?${params}`);
  const data = await res.json();

  console.log("NewsAPI status:", data.status);
  console.log("Total results:", data.totalResults);
  console.log("NewsAPI error:", data.message);

  const articles: NewsArticle[] = (data.articles ?? []).slice(0, 5).map((item: any) => ({
  title: item.title,
  link: item.url,
  source: item.source?.name ?? "",
  date: item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : "",
  snippet: item.description ?? "",
  thumbnail: item.urlToImage,
}));

  return { search: searchText, articles };
}