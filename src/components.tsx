import { Link } from 'react-router-dom';
import { ArrowUpRight, MapPin, Users, CalendarDays, Compass } from 'lucide-react';
import type { Tournament, Leader } from './types';
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';
import { useSite } from './context';
type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled' | 'onClick'> & { children: ReactNode; isDisabled?: boolean; onPress?: () => void; variant?: 'secondary' };
export function Button({children,className='',isDisabled=false,onPress,variant,...props}:ButtonProps) { return <button {...props} className={`button ${variant||''} ${className}`.trim()} disabled={isDisabled} onClick={onPress}>{children}</button>; }
export function Brand() { return <span className="brand"><Compass size={34} strokeWidth={1.3}/><span>ONE PIECE<span className="brand-sub">TCG <i>LIETUVA</i></span></span></span>; }
export function CardImage({ leader, className = '' }: {leader: Leader; className?: string}) {
  const palette:Record<string,string>={Red:'#a83d3d',Green:'#347657',Blue:'#356f9f',Purple:'#74509a',Black:'#343b46',Yellow:'#a47b1f'};
  const colors=leader.colors.map(color=>palette[color]).filter(Boolean);
  const initials=leader.name.split(/[.\s]+/).filter(Boolean).slice(0,2).map(part=>part[0]).join('');
  const style={'--leader-a':colors[0]||'#475c4a','--leader-b':colors[1]||colors[0]||'#475c4a'} as CSSProperties;
  return <div className={`card-art leader-artwork ${className}`} style={style} role="img" aria-label={`${leader.name} · ${leader.id}`}><span className="leader-artwork-mark">{initials}</span><span className="leader-artwork-name">{leader.name}</span><span className="leader-artwork-code">{leader.id}</span></div>;
}
export function Colors({colors}:{colors:string[]}) { const {lang}=useSite(); const labels:Record<string,string>={Red:'Raudona',Green:'Žalia',Blue:'Mėlyna',Purple:'Violetinė',Black:'Juoda',Yellow:'Geltona'}; return <span className="colors">{colors.map(c=><span key={c} className="color-badge"><i style={{background:({Red:'#ec6666',Green:'#55b88a',Blue:'#63a7e4',Purple:'#ad84d9',Black:'#707887',Yellow:'#e2c264'} as Record<string,string>)[c]}}/>{lang==='lt'?labels[c]:c}</span>)}</span>; }
export function dateLabel(date:string,lang:string,options?:Intl.DateTimeFormatOptions) { return new Intl.DateTimeFormat(lang==='lt'?'lt-LT':'en-GB',{day:'numeric',month:'short',year:'numeric',...options}).format(new Date(date+'T12:00:00')); }
export function EventCard({event,featured=false}:{event:Tournament;featured?:boolean}) { const {t,lang}=useSite(); const d=new Date(event.date+'T12:00:00'); return <Link className={`event-card ${featured?'featured':''}`} to={`/tournaments/${event.id}`}><div className="event-card-top"><span className="eyebrow">{event.city}</span><span className="pill">{event.format}</span></div><div className="event-body"><div className="date-tile"><span>{new Intl.DateTimeFormat(lang==='lt'?'lt-LT':'en-GB',{month:'short'}).format(d).replace('.','')}</span><strong>{d.getDate()}</strong></div><div><h3>{event.name}</h3><p><MapPin size={13}/>{event.venue}</p><p><CalendarDays size={13}/>{event.time} · Europe/Vilnius</p></div></div><div className="event-bottom"><span><Users size={14}/>{event.participants} {t.participants.toLowerCase()}</span><ArrowUpRight size={18}/></div></Link>; }
export function SectionTitle({title,subtitle,link,label}:{title:string;subtitle?:string;link?:string;label?:string}) { return <div className="section-heading"><div><h2>{title}</h2>{subtitle&&<p>{subtitle}</p>}</div>{link&&<Link className="text-link" to={link}>{label}<ArrowUpRight size={16}/></Link>}</div>; }
export function Empty({children}:{children:React.ReactNode}) { return <div className="empty"><Compass size={30}/><p>{children}</p></div>; }
