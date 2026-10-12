import type { SiteData, Tournament } from './types';
export function leaderStats(data: SiteData) {
  const entries = data.tournaments.filter(t => t.published).flatMap(t => t.results);
  return data.leaders.map(leader => {
    const results = entries.filter(r => r.leaderId === leader.id);
    const top4 = results.filter(r => r.placement <= 4).length;
    return { ...leader, entries: results.length, share: entries.length ? results.length / entries.length * 100 : 0, top4, top4Rate: results.length ? top4 / results.length * 100 : 0 };
  }).sort((a, b) => b.entries - a.entries);
}
export function playerStats(data: SiteData) {
  return data.players.map(player => {
    const history = data.tournaments.filter(t => t.published).flatMap(t => t.results.filter(r => r.playerId === player.id).map(r => ({ ...r, tournament: t })));
    return { ...player, history, wins: history.filter(r => r.placement === 1).length, top4: history.filter(r => r.placement <= 4).length, points: history.reduce((sum, r) => sum + Math.max(0, 9 - r.placement), 0) };
  }).sort((a, b) => b.points - a.points || b.wins - a.wins || a.name.localeCompare(b.name));
}
export function today() { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Vilnius', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); }
export function validateTournament(t: Tournament) {
  if (!t.name.trim() || !t.city.trim() || !t.venue.trim()) throw new Error('Fill in the tournament name, city, and venue.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t.date) || Number.isNaN(Date.parse(t.date)) || new Date(t.date).toISOString().slice(0,10) !== t.date) throw new Error('Choose a valid date.');
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(t.time)) throw new Error('Choose a valid time.');
  if (!Number.isInteger(t.participants) || t.participants < 1 || t.participants > 128) throw new Error('Participant count must be between 1 and 128.');
  if (t.results.length > t.participants) throw new Error('Results exceed the participant count.');
  if (new Set(t.results.map(r => r.playerId)).size !== t.results.length) throw new Error('A player can only appear once per tournament.');
  if (new Set(t.results.map(r => r.placement)).size !== t.results.length) throw new Error('Placements must be unique.');
  for (const r of t.results) {
    if (!r.playerId || !r.leaderId || !Number.isInteger(r.placement) || r.placement < 1 || r.placement > t.participants || [r.wins, r.losses, r.draws].some(n => !Number.isInteger(n) || n < 0 || n > 128)) throw new Error('Check result placements, players, leaders, and match records.');
  }
}
