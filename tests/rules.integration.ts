import { readFileSync } from 'node:fs';
import { beforeAll, afterAll, describe, it } from 'vitest';
import { initializeTestEnvironment, assertFails, assertSucceeds, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where, writeBatch } from 'firebase/firestore';
let env:RulesTestEnvironment;
const event={name:'Local event',date:'2026-10-24',time:'12:00',city:'Vilnius',venue:'Venue',format:'Standard',participants:128,organiserId:'org-a',published:false};
const result={playerId:'player-a',leaderId:'OP05-060',placement:1,wins:3,losses:0,draws:0};
const user=(uid:string)=>env.authenticatedContext(uid,{email:`${uid}@example.com`}).firestore();
beforeAll(async()=>{
 env=await initializeTestEnvironment({projectId:'demo-onepiecetcg',firestore:{rules:readFileSync('firestore.rules','utf8'),host:'127.0.0.1',port:8080}});
 await env.withSecurityRulesDisabled(async c=>{
  const db=c.firestore();await Promise.all([
   setDoc(doc(db,'roles','owner'),{role:'owner'}),setDoc(doc(db,'roles','admin'),{role:'admin'}),setDoc(doc(db,'roles','admin-two'),{role:'admin'}),setDoc(doc(db,'roles','editor'),{role:'editor'}),setDoc(doc(db,'roles','org-a'),{role:'organiser'}),setDoc(doc(db,'roles','org-b'),{role:'organiser'}),
   setDoc(doc(db,'players','player-a'),{name:'Player A',city:'Vilnius'}),
   setDoc(doc(db,'tournaments','draft'),event),setDoc(doc(db,'tournaments','public'),{...event,published:true}),
   setDoc(doc(db,'tournaments','draft','results','player-a'),result),setDoc(doc(db,'tournaments','public','results','player-a'),result)
  ]);
 });
});
afterAll(async()=>{await env?.cleanup();});
describe('public access',()=>{
 it('allows published events and results',async()=>{const db=env.unauthenticatedContext().firestore();await assertSucceeds(getDoc(doc(db,'tournaments','public')));await assertSucceeds(getDoc(doc(db,'tournaments','public','results','player-a')));});
 it('rejects drafts and draft results',async()=>{const db=env.unauthenticatedContext().firestore();await assertFails(getDoc(doc(db,'tournaments','draft')));await assertFails(getDoc(doc(db,'tournaments','draft','results','player-a')));});
 it('allows queries constrained to published events',async()=>{await assertSucceeds(getDocs(query(collection(env.unauthenticatedContext().firestore(),'tournaments'),where('published','==',true))));});
 it('rejects an unrestricted public tournament query',async()=>{await assertFails(getDocs(collection(env.unauthenticatedContext().firestore(),'tournaments')));});
 it('rejects writes from visitors and unapproved Google accounts',async()=>{await assertFails(setDoc(doc(env.unauthenticatedContext().firestore(),'tournaments','visitor'),event));await assertFails(setDoc(doc(user('viewer'),'tournaments','viewer'),{...event,organiserId:'viewer'}));});
});
describe('organiser isolation',()=>{
 it('allows an organiser to read and edit their draft',async()=>{await assertSucceeds(getDoc(doc(user('org-a'),'tournaments','draft')));await assertSucceeds(updateDoc(doc(user('org-a'),'tournaments','draft'),{name:'Updated event'}));});
 it('rejects another organiser reading or editing drafts',async()=>{await assertFails(getDoc(doc(user('org-b'),'tournaments','draft')));await assertFails(updateDoc(doc(user('org-b'),'tournaments','draft'),{name:'Hijacked'}));});
 it('rejects editing another organiser’s published results',async()=>{await assertFails(updateDoc(doc(user('org-b'),'tournaments','public','results','player-a'),{wins:6}));});
 it('rejects assigning an event to another organiser',async()=>{await assertFails(setDoc(doc(user('org-a'),'tournaments','wrong-owner'),{...event,organiserId:'org-b'}));await assertFails(updateDoc(doc(user('org-a'),'tournaments','draft'),{organiserId:'org-b'}));});
 it('supports creating an event and 128 results atomically',async()=>{const db=user('org-a');const batch=writeBatch(db);batch.set(doc(db,'tournaments','large'),event);for(let i=0;i<128;i++)batch.set(doc(db,'tournaments','large','results',`p${i}`),{...result,playerId:`p${i}`,placement:i+1});await assertSucceeds(batch.commit());});
 it('rejects mismatched result document IDs',async()=>{await assertFails(setDoc(doc(user('org-a'),'tournaments','draft','results','wrong'),result));});
 it('rejects invalid records and extra fields',async()=>{await assertFails(setDoc(doc(user('org-a'),'tournaments','draft','results','player-a'),{...result,wins:-1}));await assertFails(setDoc(doc(user('org-a'),'tournaments','draft','results','player-a'),{...result,role:'admin'}));});
});
describe('account permissions',()=>{
 it('allows admins to add leaders',async()=>{await assertSucceeds(setDoc(doc(user('admin'),'leaders','OP05-060'),{name:'Monkey.D.Luffy',colors:['Purple']}));});
 it('rejects organiser changes to the leader catalog',async()=>{await assertFails(setDoc(doc(user('org-a'),'leaders','OP05-060'),{name:'Changed',colors:['Purple']}));});
 it('lets a signed-in user register only their own email and name',async()=>{await assertSucceeds(setDoc(doc(user('viewer'),'accounts','viewer'),{email:'viewer@example.com',name:'Viewer'}));await assertFails(setDoc(doc(user('viewer'),'accounts','other'),{email:'viewer@example.com',name:'Other'}));});
 it('rejects assigning yourself an organiser or admin role',async()=>{await assertFails(setDoc(doc(user('viewer'),'roles','viewer'),{role:'admin'}));await assertFails(setDoc(doc(user('org-a'),'roles','org-a'),{role:'admin'}));});
 it('rejects injecting a role into account details',async()=>{await assertFails(setDoc(doc(user('viewer'),'accounts','viewer'),{email:'viewer@example.com',name:'Viewer',role:'admin'}));});
 it('allows admins to approve routine roles with an audit trail',async()=>{await assertSucceeds(setDoc(doc(user('admin'),'roles','new-org'),{role:'organiser',grantedBy:'admin',grantedAt:serverTimestamp()}));await assertSucceeds(setDoc(doc(user('admin'),'roles','new-editor'),{role:'editor',grantedBy:'admin',grantedAt:serverTimestamp()}));});
 it('rejects forged or partial role audit data',async()=>{await assertFails(setDoc(doc(user('admin'),'roles','forged'),{role:'organiser',grantedBy:'someone-else',grantedAt:serverTimestamp()}));await assertFails(setDoc(doc(user('admin'),'roles','partial'),{role:'organiser',grantedBy:'admin'}));});
 it('reserves administrator grants for the owner',async()=>{await assertFails(setDoc(doc(user('admin'),'roles','new-admin'),{role:'admin'}));await assertSucceeds(setDoc(doc(user('owner'),'roles','new-admin'),{role:'admin',grantedBy:'owner',grantedAt:serverTimestamp()}));});
 it('prevents creating another owner or changing the owner',async()=>{await assertFails(setDoc(doc(user('owner'),'roles','second-owner'),{role:'owner'}));await assertFails(setDoc(doc(user('owner'),'roles','owner'),{role:'admin'}));});
 it('prevents administrators changing administrator accounts',async()=>{await assertFails(setDoc(doc(user('admin'),'roles','admin-two'),{role:'viewer'}));});
 it('prevents an administrator removing their own access',async()=>{await assertFails(setDoc(doc(user('admin'),'roles','admin'),{role:'viewer'}));});
 it('allows administrators to edit other organisers’ events',async()=>{await assertSucceeds(updateDoc(doc(user('admin'),'tournaments','public'),{name:'Admin correction'}));});
 it('keeps account email addresses private',async()=>{await assertFails(getDoc(doc(user('org-a'),'accounts','viewer')));await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(),'accounts','viewer')));});
});
describe('content editor boundaries',()=>{
 it('allows editors to create and correct public content',async()=>{await assertSucceeds(setDoc(doc(user('editor'),'players','player-b'),{name:'Player B',city:'Kaunas'}));await assertSucceeds(updateDoc(doc(user('editor'),'players','player-a'),{city:'Klaipėda'}));await assertSucceeds(setDoc(doc(user('editor'),'leaders','OP01-001'),{name:'Leader',colors:['Red']}));await assertSucceeds(setDoc(doc(user('editor'),'news','item'),{titleLt:'Naujiena',titleEn:'News',bodyLt:'Tekstas',bodyEn:'Body',date:'2026-10-12'}));});
 it('rejects obsolete or unexpected leader fields',async()=>{await assertFails(setDoc(doc(user('editor'),'leaders','OP01-002'),{name:'Leader',colors:['Red'],image:'https://example.com/card.png'}));});
 it('prevents editors from managing events or roles',async()=>{await assertFails(setDoc(doc(user('editor'),'tournaments','editor-event'),{...event,organiserId:'editor'}));await assertFails(setDoc(doc(user('editor'),'roles','someone'),{role:'organiser'}));});
 it('lets organisers add players but not edit catalog content',async()=>{await assertSucceeds(setDoc(doc(user('org-a'),'players','player-c'),{name:'Player C',city:'Šiauliai'}));await assertFails(updateDoc(doc(user('org-a'),'players','player-a'),{city:'Kaunas'}));await assertFails(setDoc(doc(user('org-a'),'news','blocked'),{titleLt:'Naujiena',titleEn:'News',bodyLt:'Tekstas',bodyEn:'Body',date:'2026-10-12'}));});
});
