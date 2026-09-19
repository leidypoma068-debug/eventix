export function PageTitle({ eyebrow = 'EVENTIX ADMIN', title, description, actions }) {
    return <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-violet-600">{eyebrow}</p><h1 className="mt-2 text-3xl font-black text-slate-900">{title}</h1>{description && <p className="mt-2 max-w-3xl text-sm text-slate-500">{description}</p>}</div>{actions && <div className="flex flex-wrap gap-2">{actions}</div>}</div>;
}

export function Card({ children, className = '' }) { return <section className={`rounded-3xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</section>; }

export function StatCard({ icon: Icon, label, value, note }) { return <Card className="p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-slate-500">{label}</p><p className="mt-2 text-3xl font-black text-slate-900">{value}</p>{note && <p className="mt-2 text-xs text-slate-400">{note}</p>}</div>{Icon && <div className="rounded-2xl bg-violet-100 p-3"><Icon className="h-6 w-6 text-violet-700" /></div>}</div></Card>; }

export function Badge({ children, tone = 'slate' }) {
    const tones = { green:'bg-emerald-100 text-emerald-700', red:'bg-red-100 text-red-700', amber:'bg-amber-100 text-amber-700', blue:'bg-blue-100 text-blue-700', violet:'bg-violet-100 text-violet-700', pink:'bg-pink-100 text-pink-700', slate:'bg-slate-100 text-slate-600' };
    return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${tones[tone] || tones.slate}`}>{children}</span>;
}

export function Progress({ value = 0 }) { const v = Math.max(0, Math.min(100, Number(value) || 0)); return <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600" style={{ width: `${v}%` }} /></div>; }

export function money(value) { return `Bs ${Number(value || 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
