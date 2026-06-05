export function getTrailing12Months(): string[] {
  const months: string[] = [];
  const now = new Date();

  // Return months from January up to the current month (year-to-date).
  // Example: if now is June, returns ["Jan", "Feb", "Mar", "Apr", "May", "Jun"].
  const year = now.getFullYear();
  const currentMonthIndex = now.getMonth(); // 0-based

  for (let m = 0; m <= currentMonthIndex; m += 1) {
    const date = new Date(year, m, 1);
    months.push(date.toLocaleString('en-US', { month: 'short' }));
  }

  return months;
}

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return isoString;
  }
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
