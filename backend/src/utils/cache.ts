import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 900, checkperiod: 120 });

export function get<T>(key: string): T | undefined {
  return cache.get<T>(key.trim().toLowerCase());
}

export function set<T>(key: string, value: T): void {
  cache.set(key.trim().toLowerCase(), value);
}
