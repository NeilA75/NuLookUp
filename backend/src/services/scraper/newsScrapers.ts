import { getPage, closePage } from './scraperClient';
import { Article } from '../../types/search';

export async function getScrapedNews(query: string): Promise<Article[]> {
  const page = await getPage();
  try {
    const url = `https://news.google.com/search?q=${encodeURIComponent(query)}`;
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2500);

    const articles = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('article'))
        .slice(0, 10)
        .map((article) => {
          const title = (article.querySelector('h3') as HTMLElement | null)?.innerText || '';
          const source = (article.querySelector('.SVJrMe') as HTMLElement | null)?.innerText || '';
          const linkElement = article.querySelector('a[href]');
          const relativeDate = (article.querySelector('time') as HTMLElement | null)?.getAttribute('datetime') || (article.querySelector('time') as HTMLElement | null)?.innerText || '';
          const snippet = (article.querySelector('.xBbh9') as HTMLElement | null)?.innerText || '';
          const href = linkElement ? linkElement.getAttribute('href') || '' : '';
          const link = href.startsWith('./') ? `https://news.google.com${href.slice(1)}` : href;

          return {
            title,
            source,
            date: relativeDate,
            link,
            snippet,
          };
        })
        .filter((item) => item.title && item.link);
    });

    return articles;
  } catch (error) {
    console.error('getScrapedNews error', error);
    return [];
  } finally {
    await closePage(page);
  }
}
