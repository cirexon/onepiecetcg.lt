import type { SiteData, Leader } from './types';
export const leaders: Leader[] = [
  { id: 'OP01-001', name: 'Roronoa Zoro', colors: ['Red'] },
  { id: 'OP05-060', name: 'Monkey.D.Luffy', colors: ['Purple'] },
  { id: 'OP05-098', name: 'Enel', colors: ['Yellow'] },
  { id: 'OP06-022', name: 'Yamato', colors: ['Green', 'Yellow'] },
  { id: 'OP07-079', name: 'Rob Lucci', colors: ['Black'] },
  { id: 'OP01-060', name: 'Donquixote Doflamingo', colors: ['Blue'] },
];
export const demo: SiteData = {
  leaders,
  players: [
    { id: 'jonas', name: 'Jonas K.', city: 'Vilnius' }, { id: 'matas', name: 'Matas P.', city: 'Kaunas' },
    { id: 'ieva', name: 'Ieva V.', city: 'Vilnius' }, { id: 'lukas', name: 'Lukas S.', city: 'Klaipėda' },
    { id: 'tomas', name: 'Tomas B.', city: 'Kaunas' }, { id: 'greta', name: 'Greta M.', city: 'Vilnius' },
    { id: 'dovydas', name: 'Dovydas R.', city: 'Vilnius' }, { id: 'rokas', name: 'Rokas J.', city: 'Kaunas' },
  ],
  tournaments: [
    { id: 'vilnius-oct', name: 'Vilnius · Grand Line Open', date: '2026-10-24', time: '12:00', city: 'Vilnius', venue: 'Demo venue · Vilnius', format: 'Standard', participants: 32, organiserId: 'demo', published: true, results: [] },
    { id: 'kaunas-oct', name: 'Kaunas · Saturday locals', date: '2026-10-17', time: '13:00', city: 'Kaunas', venue: 'Demo venue · Kaunas', format: 'Standard', participants: 16, organiserId: 'demo', published: true, results: [] },
    { id: 'klaipeda-oct', name: 'Klaipėda · Sealed adventure', date: '2026-10-31', time: '11:00', city: 'Klaipėda', venue: 'Demo venue · Klaipėda', format: 'Sealed', participants: 12, organiserId: 'demo', published: true, results: [] },
    { id: 'vilnius-sep', name: 'Vilnius · Sunday locals', date: '2026-10-04', time: '12:00', city: 'Vilnius', venue: 'Demo venue · Vilnius', format: 'Standard', participants: 8, organiserId: 'demo', published: true, results: [
      {playerId:'jonas',leaderId:'OP05-060',placement:1,wins:3,losses:0,draws:0},
      {playerId:'ieva',leaderId:'OP07-079',placement:2,wins:2,losses:1,draws:0},
      {playerId:'matas',leaderId:'OP06-022',placement:3,wins:2,losses:1,draws:0},
      {playerId:'lukas',leaderId:'OP05-098',placement:4,wins:2,losses:1,draws:0},
      {playerId:'tomas',leaderId:'OP01-001',placement:5,wins:1,losses:2,draws:0},
      {playerId:'greta',leaderId:'OP05-060',placement:6,wins:1,losses:2,draws:0},
      {playerId:'dovydas',leaderId:'OP01-060',placement:7,wins:1,losses:2,draws:0},
      {playerId:'rokas',leaderId:'OP07-079',placement:8,wins:0,losses:3,draws:0}
    ] },
    { id: 'kaunas-sep', name: 'Kaunas · Grand Line Cup', date: '2026-09-26', time: '13:00', city: 'Kaunas', venue: 'Demo venue · Kaunas', format: 'Standard', participants: 8, organiserId: 'demo', published: true, results: [
      {playerId:'matas',leaderId:'OP06-022',placement:1,wins:3,losses:0,draws:0},
      {playerId:'jonas',leaderId:'OP05-060',placement:2,wins:2,losses:1,draws:0},
      {playerId:'tomas',leaderId:'OP01-001',placement:3,wins:2,losses:1,draws:0},
      {playerId:'greta',leaderId:'OP05-098',placement:4,wins:2,losses:1,draws:0},
      {playerId:'lukas',leaderId:'OP01-060',placement:5,wins:1,losses:2,draws:0},
      {playerId:'ieva',leaderId:'OP07-079',placement:6,wins:1,losses:2,draws:0},
      {playerId:'dovydas',leaderId:'OP05-060',placement:7,wins:1,losses:2,draws:0},
      {playerId:'rokas',leaderId:'OP05-098',placement:8,wins:0,losses:3,draws:0}
    ] },
  ],
  news: [{id:'welcome',date:'2026-10-01',titleLt:'Sveiki atvykę į savo įgulą',titleEn:'Welcome to your crew',bodyLt:'Tai demonstracinė Lietuvos One Piece TCG bendruomenės svetainė. Atraskite turnyrus, žaidėjus ir lyderių statistiką. Visi pateikti renginiai ir rezultatai yra pavyzdžiai.',bodyEn:'A preview of the Lithuanian One Piece TCG community hub. Discover tournaments, players, and leader statistics. All events and results shown here are examples.'}]
};
