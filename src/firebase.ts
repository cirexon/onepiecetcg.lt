import { initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, getFirestore, limit, query, serverTimestamp, setDoc, where, writeBatch } from 'firebase/firestore';
import type { Account, News, Player, SiteData, Tournament } from './types';
import { validateTournament } from './stats';
import { leaderCatalog } from './catalog';
const config = { apiKey: import.meta.env.VITE_FIREBASE_API_KEY, authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID, appId: import.meta.env.VITE_FIREBASE_APP_ID };
export const configured = Object.values(config).every(Boolean);
const app = configured ? initializeApp(config) : null;
const appCheckKey = import.meta.env.VITE_FIREBASE_APPCHECK_SITE_KEY;
const productionBrowser = !['localhost', '127.0.0.1'].includes(window.location.hostname);
if (app && appCheckKey && productionBrowser) initializeAppCheck(app, { provider: new ReCaptchaEnterpriseProvider(appCheckKey), isTokenAutoRefreshEnabled: true });
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
const publicAuthCodes = new Set(['auth/configuration-not-found','auth/operation-not-allowed','auth/unauthorized-domain','auth/popup-closed-by-user','auth/cancelled-popup-request']);
export async function login() {
  if (!auth) throw new Error('Firebase is not connected. Follow the setup guide in README.md.');
  try { await signInWithPopup(auth, new GoogleAuthProvider()); }
  catch (error) {
    const code=typeof error==='object'&&error&&'code' in error?String(error.code):'';
    if (publicAuthCodes.has(code)) throw error;
    throw new Error('Authentication failed. Try again.');
  }
}
export async function logout() { if (auth) try { await signOut(auth); } catch { throw new Error('Sign-out failed. Try again.'); } }
export async function loadRole(uid: string) { const snap = await getDoc(doc(db!, 'roles', uid)); return snap.exists() ? snap.data().role as Account['role'] : 'viewer'; }
export async function registerAccount(uid: string, email: string, name: string) { await setDoc(doc(db!, 'accounts', uid), { email, name }); }
export async function loadData(account: Account | null): Promise<SiteData> {
  const eventQuery = account && ['admin','owner'].includes(account.role) ? query(collection(db!, 'tournaments'), limit(100)) : query(collection(db!, 'tournaments'), where('published', '==', true), limit(100));
  const [events, players, news] = await Promise.all([getDocs(eventQuery), getDocs(query(collection(db!, 'players'), limit(1000))), getDocs(query(collection(db!, 'news'), limit(30)))]);
  const docs = new Map(events.docs.map(d => [d.id, d]));
  if (account?.role === 'organiser') { const own = await getDocs(query(collection(db!, 'tournaments'), where('organiserId', '==', account.id), limit(100))); own.docs.forEach(d => docs.set(d.id, d)); }
  const tournaments = await Promise.all([...docs.values()].map(async d => {
    const results = await getDocs(query(collection(db!, 'tournaments', d.id, 'results'), limit(128)));
    return { ...d.data(), id: d.id, results: results.docs.map(r => r.data()) } as Tournament;
  }));
  return { tournaments, players: players.docs.map(d => ({...d.data(),id:d.id})) as Player[], leaders: leaderCatalog, news: news.docs.map(d => ({...d.data(),id:d.id})) as News[] };
}
export async function saveTournament(t: Tournament, existing = false) {
  validateTournament(t);
  const { id, results, ...fields } = t;
  const old = existing ? await getDocs(collection(db!, 'tournaments', id, 'results')) : null;
  const batch = writeBatch(db!);
  batch.set(doc(db!, 'tournaments', id), fields);
  const keep = new Set(results.map(r => r.playerId));
  old?.docs.forEach(d => { if (!keep.has(d.id)) batch.delete(d.ref); });
  results.forEach(r => batch.set(doc(db!, 'tournaments', id, 'results', r.playerId), r));
  await batch.commit();
}
export async function savePlayer(p: Player) { const {id,...fields}=p; await setDoc(doc(db!, 'players', id), fields); }
export async function saveNews(n: News) { const {id,...fields}=n; await setDoc(doc(db!, 'news', id), fields); }
export async function setRole(uid: string, role: Account['role']) {
  if (!auth?.currentUser) throw new Error('Sign in again before changing permissions.');
  await setDoc(doc(db!, 'roles', uid), { role, grantedBy: auth.currentUser.uid, grantedAt: serverTimestamp() });
}
export async function loadAccounts(): Promise<Account[]> {
  const [accounts,roles] = await Promise.all([getDocs(query(collection(db!, 'accounts'),limit(200))),getDocs(query(collection(db!, 'roles'),limit(200)))]);
  const roleMap = new Map(roles.docs.map(d=>[d.id,d.data().role]));
  return accounts.docs.map(d=>({...d.data(),id:d.id,role:roleMap.get(d.id)||'viewer'})) as Account[];
}
