import { compareKeys, sessionSortKey, titleSortKey } from './subjects';

export const SORTS = [
  { key: 'newest', label: 'Latest first' },
  { key: 'oldest', label: 'Oldest first' },
  { key: 'az', label: 'A to Z' },
  { key: 'za', label: 'Z to A' },
];

const byTitle = (a, b) => compareKeys(titleSortKey(a.name), titleSortKey(b.name));
export function compareItems(sort) {
  return (a, b) => {
    switch (sort) {
      case 'az': return byTitle(a, b) || sessionSortKey(b.name) - sessionSortKey(a.name);
      case 'za': return byTitle(b, a) || sessionSortKey(b.name) - sessionSortKey(a.name);
      case 'oldest': return sessionSortKey(a.name) - sessionSortKey(b.name) || byTitle(a, b);
      default: return sessionSortKey(b.name) - sessionSortKey(a.name) || byTitle(a, b);
    }
  };
}
