import { createContext, useContext } from 'react';
import type { SiteData, Account } from './types';
import type { Copy, Lang } from './i18n';
export interface SiteContext { data: SiteData; account: Account | null; lang: Lang; t: Copy; refresh: () => Promise<void>; notify: (message: string) => void }
export const Context = createContext<SiteContext>(null!);
export const useSite = () => useContext(Context);
