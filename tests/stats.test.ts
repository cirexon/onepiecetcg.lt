import { describe, it, expect } from 'vitest';
import { demo } from '../src/demo';
import { leaderStats, playerStats, validateTournament } from '../src/stats';
describe('leader statistics', () => {
  it('calculates popularity from all recorded entries', () => {
    const stats=leaderStats(demo);
    expect(stats.reduce((n,s)=>n+s.entries,0)).toBe(16);
    expect(stats.reduce((n,s)=>n+s.share,0)).toBe(100);
    expect(stats.find(s=>s.id==='OP05-060')).toMatchObject({entries:4,share:25,top4:2,top4Rate:50});
  });
  it('does not count unpublished results', () => {
    const data=structuredClone(demo);data.tournaments.filter(t=>t.results.length).forEach(t=>t.published=false);
    expect(leaderStats(data).every(s=>s.entries===0&&s.share===0&&s.top4Rate===0)).toBe(true);
  });
  it('uses recorded entries when standings are incomplete',()=>{
    const data=structuredClone(demo);data.tournaments=data.tournaments.filter(t=>t.results.length).slice(0,1);data.tournaments[0].results=data.tournaments[0].results.slice(0,1);
    expect(leaderStats(data).find(s=>s.id==='OP05-060')?.share).toBe(100);
  });
});
describe('player rankings',()=>{
  it('aggregates results across events',()=>{expect(playerStats(demo).find(p=>p.id==='jonas')).toMatchObject({wins:1,top4:2,points:15});});
  it('keeps profiles for players without a login or a result',()=>{const data=structuredClone(demo);data.players.push({id:'new',name:'New',city:'Vilnius'});expect(playerStats(data).find(p=>p.id==='new')).toMatchObject({history:[],points:0});});
});
describe('result validation',()=>{
  const event=()=>structuredClone(demo.tournaments.find(t=>t.results.length)!);
  it('accepts complete standings',()=>expect(()=>validateTournament(event())).not.toThrow());
  it('rejects duplicate players',()=>{const t=event();t.results[1].playerId=t.results[0].playerId;expect(()=>validateTournament(t)).toThrow(/player can only/);});
  it('rejects duplicate placements',()=>{const t=event();t.results[1].placement=1;expect(()=>validateTournament(t)).toThrow(/unique/);});
  it('rejects out of range placements',()=>{const t=event();t.results[0].placement=9;expect(()=>validateTournament(t)).toThrow(/placements/);});
  it('rejects negative match records',()=>{const t=event();t.results[0].wins=-1;expect(()=>validateTournament(t)).toThrow(/records/);});
  it('rejects too many results',()=>{const t=event();t.participants=4;expect(()=>validateTournament(t)).toThrow(/exceed/);});
  it('rejects noninteger participant counts',()=>{const t=event();t.participants=8.5;expect(()=>validateTournament(t)).toThrow(/Participant/);});
  it('rejects dates that normalize to another month',()=>{const t=event();t.date='2026-02-31';expect(()=>validateTournament(t)).toThrow(/date/);});
});
