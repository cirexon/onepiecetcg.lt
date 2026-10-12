export type Role = 'owner' | 'admin' | 'editor' | 'organiser' | 'viewer';
export interface Player { id: string; name: string; city: string }
export interface Leader { id: string; name: string; colors: string[] }
export interface Result { playerId: string; leaderId: string; placement: number; wins: number; losses: number; draws: number }
export interface Tournament {
  id: string; name: string; date: string; time: string; city: string; venue: string;
  format: 'Standard' | 'Sealed'; participants: number; organiserId: string;
  published: boolean; results: Result[];
}
export interface News { id: string; titleLt: string; titleEn: string; bodyLt: string; bodyEn: string; date: string }
export interface Account { id: string; email: string; name: string; role: Role }
export interface SiteData { tournaments: Tournament[]; players: Player[]; leaders: Leader[]; news: News[] }
