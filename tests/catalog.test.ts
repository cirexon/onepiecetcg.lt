import { describe, expect, it } from 'vitest';
import { leaderCatalog, leaderCatalogSource, leaderCatalogUpdated } from '../src/catalog';

describe('official leader catalog',()=>{
  it('contains the complete deduplicated scan',()=>{
    expect(leaderCatalog).toHaveLength(138);
    expect(new Set(leaderCatalog.map(leader=>leader.id)).size).toBe(leaderCatalog.length);
    expect(leaderCatalogSource).toBe('https://en.onepiece-cardgame.com/cardlist/');
    expect(leaderCatalogUpdated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('contains valid report fields and known releases',()=>{
    const colors=new Set(['Red','Green','Blue','Purple','Black','Yellow']);
    for(const leader of leaderCatalog){
      expect(leader.id).toMatch(/^[A-Z]{2,3}\d{2}-\d{3}$/);
      expect(leader.name.trim()).not.toBe('');
      expect(leader.colors.length).toBeGreaterThanOrEqual(1);
      expect(leader.colors.length).toBeLessThanOrEqual(2);
      expect(leader.colors.every(color=>colors.has(color))).toBe(true);
    }
    expect(leaderCatalog).toContainEqual({id:'OP01-001',name:'Roronoa Zoro',colors:['Red']});
    expect(leaderCatalog).toContainEqual({id:'OP17-099',name:'Charlotte Linlin',colors:['Yellow']});
    expect(leaderCatalog).toContainEqual({id:'ST30-001',name:'Luffy & Ace',colors:['Red','Green']});
  });
});
