import catalog from './data/leader-catalog.json';
import type { Leader } from './types';

export const leaderCatalog = catalog as Leader[];
export const leaderCatalogSource = 'https://en.onepiece-cardgame.com/cardlist/';
export const leaderCatalogUpdated = '2026-10-12';
