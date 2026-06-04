import axios from 'axios';
import { Article } from '../../types/search';
import { formatDate } from '../../utils/dateHelpers';

export async function getNewsApiArticles(query: string): Promise<Article[]> {
  try {
    const apiKey = process.env.NEWS_API_KEY;
    if (!apiKey) {
      return [];
    }

    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: query,
        sortBy: 'publishedAt',
        pageSize: 10,
      },
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      timeout: 20000,
    });

    const articles = response.data?.articles ?? [];
    return articles.map((item: any) => ({
      title: item.title || '',
      link: item.url || '',
      source: item.source?.name || 'NewsAPI',
      date: item.publishedAt ? formatDate(item.publishedAt) : '',
      snippet: item.description || item.content || '',
      thumbnail: item.urlToImage || undefined,
    }));
  } catch (error) {
    console.error('getNewsApiArticles error', error);
    return [];
  }
}
