import { Article } from '../../types/search';
import { getNewsApiArticles } from './newsApi';
import { getScrapedNews } from '../scraper/newsScrapers';

function dedupeArticles(articles: Article[]): Article[] {
  const titles = new Set<string>();
  return articles.filter((article) => {
    const key = article.title.toLowerCase().trim();
    if (!key || titles.has(key)) {
      return false;
    }
    titles.add(key);
    return true;
  });
}

function sortArticles(articles: Article[]): Article[] {
  return articles.slice().sort((a, b) => {
    const aTime = new Date(a.date).getTime() || 0;
    const bTime = new Date(b.date).getTime() || 0;
    return bTime - aTime;
  });
}

export async function getNewsArticles(query: string): Promise<Article[]> {
  try {
    const primary = await getNewsApiArticles(query);
    const articles = [...primary];

    if (articles.length < 5) {
      const supplemental = await getScrapedNews(query);
      articles.push(...supplemental);
    }

    const deduped = dedupeArticles(articles);
    return sortArticles(deduped).slice(0, 10);
  } catch (error) {
    console.error('getNewsArticles error', error);
    return [];
  }
}
