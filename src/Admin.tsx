import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, ShieldCheck, Compass } from 'lucide-react';
import { useSite } from './context';
import { Button } from './components';
import { configured, loadAccounts, saveTournament, savePlayer, saveNews, setRole, saveLeaders } from './firebase';
import { leaders } from './demo';
import { assignableRoles, canChangeAccountRole, canManageAllEvents, canManageContent, canManageOwnEvents, canManageRoles, roleOrder } from './roles';
import { today } from './stats';
import { safeErrorMessage } from './errors';
import type { Account, Role, Tournament } from './types';

export default function Admin() {
  const { data, t, lang, account, refresh, notify } = useSite();
  const [editing, setEditing] = useState<Tournament | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    if (account && canManageRoles(account.role)) loadAccounts().then(setAccounts).catch(e => setError(safeErrorMessage(e, lang)));
  }, [account, lang]);

  if (!configured || !account) return <div className="container page"><div className="notice">{t.disconnected}</div><Link className="primary-link" to="/login">{t.login}</Link></div>;
  if (account.role === 'viewer') return <div className="container page"><ShieldCheck size={40}/><div className="page-heading"><h1>{t.access}</h1><p>{t.accessBody}</p></div><p>{account.email}</p><p className="sample-note">UID: {account.id}</p></div>;

  const own = data.tournaments.filter(event => canManageAllEvents(account.role) || event.organiserId === account.id).sort((a, b) => b.date.localeCompare(a.date));
  const roleLabels: Record<Role, string> = { viewer: t.viewer, organiser: t.organiser, editor: t.editor, admin: t.accountAdmin, owner: t.owner };
  const run = async (fn: () => Promise<void>) => {
    setBusy(true); setError('');
    try { await fn(); await refresh(); notify(t.saved); }
    catch (e) { setError(safeErrorMessage(e, lang)); }
    finally { setBusy(false); }
  };
  const newEvent = () => setEditing({ id: crypto.randomUUID(), name: '', date: today(), time: '12:00', city: 'Vilnius', venue: '', format: 'Standard', participants: 16, organiserId: account.id, published: false, results: [] });

  return <div className="container page admin-page">
    <div className="page-heading"><span className="eyebrow">{roleLabels[account.role].toUpperCase()} · {account.email}</span><h1>{t.manageTitle}</h1><p>{t.manageSub}</p></div>
    {error && <div className="notice error" role="alert">{error}</div>}

    {canManageOwnEvents(account.role) && (editing
      ? <TournamentEditor editing={editing} setEditing={setEditing} busy={busy} onSave={() => run(async () => {
        if (editing.results.some(result => !data.players.some(player => player.id === result.playerId) || !data.leaders.some(leader => leader.id === result.leaderId))) throw new Error('Select an existing player and leader for every result.');
        await saveTournament(editing, data.tournaments.some(event => event.id === editing.id)); setEditing(null);
      })}/>
      : <><Button className="gold-button" onPress={newEvent}><Plus size={17}/>{t.newEvent}</Button><div className="manage-events">{own.map(event => <div key={event.id}><div><span className={`pill ${event.published ? '' : 'draft'}`}>{event.published ? t.published : t.draft}</span><h3>{event.name}</h3><p>{event.date} · {event.city} · {event.results.length} {t.recorded}</p></div><Button variant="secondary" onPress={() => setEditing(structuredClone(event))}><Pencil size={15}/>{t.edit}</Button></div>)}</div></>)}

    {(canManageOwnEvents(account.role) || canManageContent(account.role)) && <form className="editor" onSubmit={event => { event.preventDefault(); const form = event.currentTarget; const values = new FormData(form); void run(async () => { await savePlayer({ id: crypto.randomUUID(), name: String(values.get('name')).trim(), city: String(values.get('city')).trim() }); form.reset(); }); }}><h2>{t.addPlayer}</h2><div className="form-grid"><label>{t.name}<input name="name" required maxLength={80}/></label><label>{t.city}<input name="city" required maxLength={80}/></label></div><Button type="submit" variant="secondary" isDisabled={busy}>{t.addPlayer}</Button></form>}

    {canManageRoles(account.role) && <section className="editor"><h2>{t.roles}</h2><p className="sample-note">{t.permissions}</p><p className="sample-note">{t.rolesNote}</p>{accounts.map(target => {
      const allowed = assignableRoles(account.role);
      const mutable = canChangeAccountRole(account.role, target.role, target.id === account.id);
      return <div className="account-row" key={target.id}><span><strong>{target.name || target.email}</strong><small>{target.email}</small></span><select aria-label={`${t.roles}: ${target.email}`} disabled={busy || !mutable} value={target.role} onChange={event => { const role = event.target.value as Role; const confirmed = window.confirm(lang === 'lt' ? `Pakeisti ${target.email} rolę iš „${roleLabels[target.role]}“ į „${roleLabels[role]}“?` : `Change ${target.email} from “${roleLabels[target.role]}” to “${roleLabels[role]}”?`); if (!confirmed) return; void run(async () => { await setRole(target.id, role); setAccounts(await loadAccounts()); }); }}>{roleOrder.map(role => <option key={role} value={role} disabled={role !== target.role && !allowed.includes(role)}>{roleLabels[role]}</option>)}</select></div>;
    })}</section>}

    {canManageContent(account.role) && <><section className="editor"><h2>{t.catalog}</h2><Button variant="secondary" isDisabled={busy} onPress={() => void run(() => saveLeaders(leaders))}><Compass size={16}/>{t.initialise}</Button></section><form className="editor" onSubmit={event => { event.preventDefault(); const form = event.currentTarget; const values = new FormData(form); void run(async () => { await saveNews({ id: crypto.randomUUID(), date: today(), titleLt: String(values.get('titleLt')).trim(), titleEn: String(values.get('titleEn')).trim(), bodyLt: String(values.get('bodyLt')).trim(), bodyEn: String(values.get('bodyEn')).trim() }); form.reset(); }); }}><h2>{t.newsTitle}</h2><div className="form-grid">{(['titleLt', 'titleEn', 'bodyLt', 'bodyEn'] as const).map(key => <label key={key}>{t[key]}{key.startsWith('body') ? <textarea name={key} required maxLength={5000} rows={5}/> : <input name={key} required maxLength={160}/>}</label>)}</div><Button type="submit" className="gold-button" isDisabled={busy}>{t.publish}</Button></form></>}

    <p className="sample-note">{lang === 'lt' ? 'Juodraščius matote tik jūs ir administratoriai. Žaidėjų vardai yra vieši — naudokite sutartą vardą arba slapyvardį.' : 'Drafts are visible only to their organiser and administrators. Player names are public — use an agreed display name or nickname.'}</p>
  </div>;
}

function TournamentEditor({ editing, setEditing, busy, onSave }: { editing: Tournament; setEditing: (t: Tournament | null) => void; busy: boolean; onSave: () => Promise<void> }) {
  const { data, t } = useSite();
  return <form className="editor" onSubmit={event => { event.preventDefault(); void onSave(); }}><h2>{editing.name || t.newEvent}</h2><fieldset disabled={busy} className="editor-fieldset"><div className="form-grid"><label>{t.eventName}<input required maxLength={120} value={editing.name} onChange={event => setEditing({ ...editing, name: event.target.value })}/></label><label>{t.city}<input required maxLength={80} value={editing.city} onChange={event => setEditing({ ...editing, city: event.target.value })}/></label><label>{t.venue}<input required maxLength={160} value={editing.venue} onChange={event => setEditing({ ...editing, venue: event.target.value })}/></label><label>{t.date}<input type="date" required value={editing.date} onChange={event => setEditing({ ...editing, date: event.target.value })}/></label><label>{t.time}<input type="time" required value={editing.time} onChange={event => setEditing({ ...editing, time: event.target.value })}/></label><label>{t.format}<select value={editing.format} onChange={event => setEditing({ ...editing, format: event.target.value as Tournament['format'] })}><option>Standard</option><option>Sealed</option></select></label><label>{t.participants}<input type="number" min={1} max={128} required value={editing.participants} onChange={event => setEditing({ ...editing, participants: Number(event.target.value) })}/></label><label className="checkbox-label"><input type="checkbox" checked={editing.published} onChange={event => setEditing({ ...editing, published: event.target.checked })}/>{t.publish}</label></div><h3>{t.results}</h3><div className="result-editor">{editing.results.map((result, index) => <div className="result-input-row" key={index}><label>{t.place}<input type="number" required min={1} max={editing.participants} value={result.placement} onChange={event => setEditing({ ...editing, results: editing.results.map((value, position) => position === index ? { ...value, placement: Number(event.target.value) } : value) })}/></label><label>{t.player}<select required value={result.playerId} onChange={event => setEditing({ ...editing, results: editing.results.map((value, position) => position === index ? { ...value, playerId: event.target.value } : value) })}><option value="">—</option>{data.players.map(player => <option key={player.id} value={player.id}>{player.name}</option>)}</select></label><label>{t.leader}<select required value={result.leaderId} onChange={event => setEditing({ ...editing, results: editing.results.map((value, position) => position === index ? { ...value, leaderId: event.target.value } : value) })}><option value="">—</option>{data.leaders.map(leader => <option key={leader.id} value={leader.id}>{leader.name} · {leader.id}</option>)}</select></label>{(['wins', 'losses', 'draws'] as const).map((key, offset) => <label key={key}>{['W', 'L', 'D'][offset]}<input type="number" min={0} max={128} required value={result[key]} onChange={event => setEditing({ ...editing, results: editing.results.map((value, position) => position === index ? { ...value, [key]: Number(event.target.value) } : value) })}/></label>)}<button type="button" className="icon-button" aria-label={t.remove} onClick={() => setEditing({ ...editing, results: editing.results.filter((_, position) => position !== index) })}><Trash2 size={17}/></button></div>)}</div><Button type="button" variant="secondary" isDisabled={busy || editing.results.length >= editing.participants} onPress={() => setEditing({ ...editing, results: [...editing.results, { playerId: '', leaderId: '', placement: editing.results.length + 1, wins: 0, losses: 0, draws: 0 }] })}><Plus size={16}/>{t.addResult}</Button><p className="sample-note">{t.statsNote}</p></fieldset><div className="form-actions"><Button type="submit" className="gold-button" isDisabled={busy}>{busy ? t.loading : t.save}</Button><Button variant="secondary" isDisabled={busy} onPress={() => setEditing(null)}>{t.cancel}</Button></div></form>;
}
