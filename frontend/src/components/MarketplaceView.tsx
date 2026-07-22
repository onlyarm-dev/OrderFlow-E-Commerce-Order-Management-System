import { useMemo, useState } from 'react';
import { useI18n, type TranslationKey } from '../i18n';

type Channel = 'all' | 'shopee' | 'lazada' | 'tiktok' | 'thaimart';
type MockStatus = 'pending' | 'processing' | 'shipped' | 'delivered';

type MockOrder = {
  id: string;
  channel: Exclude<Channel, 'all'>;
  customer: string;
  items: number;
  total: number;
  status: MockStatus;
  placed_at: string;
};

const channels = [
  { id: 'shopee' as const, name: 'Shopee', logo: '/marketplaces/shopee.svg', tone: 'bg-[#fff4f0]', accent: 'text-[#EE4D2D]' },
  { id: 'lazada' as const, name: 'Lazada', logo: '/marketplaces/lazada.svg', tone: 'bg-[#f7f3ff]', accent: 'text-[#5f259f]' },
  { id: 'tiktok' as const, name: 'TikTok Shop', logo: '/marketplaces/tiktok.svg', tone: 'bg-stone-100', accent: 'text-ink' },
  { id: 'thaimart' as const, name: 'Thaimart', logo: '/marketplaces/thaimart.svg', tone: 'bg-red-50', accent: 'text-[#D71920]' },
];

const mock_orders: MockOrder[] = [
  { id: 'SP-260722-1048', channel: 'shopee', customer: 'Nattaya P.', items: 2, total: 1380, status: 'pending', placed_at: '2026-07-22T10:48:00+07:00' },
  { id: 'LZD-87340192', channel: 'lazada', customer: 'Krit S.', items: 1, total: 1590, status: 'processing', placed_at: '2026-07-22T09:32:00+07:00' },
  { id: 'TT-TH-581204', channel: 'tiktok', customer: 'Mint Store', items: 3, total: 2070, status: 'shipped', placed_at: '2026-07-21T18:15:00+07:00' },
  { id: 'SP-260721-8892', channel: 'shopee', customer: 'Ploy K.', items: 1, total: 890, status: 'processing', placed_at: '2026-07-21T14:08:00+07:00' },
  { id: 'LZD-87338810', channel: 'lazada', customer: 'Thanawat R.', items: 2, total: 2280, status: 'delivered', placed_at: '2026-07-20T16:45:00+07:00' },
  { id: 'TT-TH-580771', channel: 'tiktok', customer: 'Aom Review', items: 1, total: 690, status: 'delivered', placed_at: '2026-07-20T11:20:00+07:00' },
  { id: 'TM-260719-0418', channel: 'thaimart', customer: 'บ้านสวนไทย', items: 4, total: 1760, status: 'pending', placed_at: '2026-07-19T17:42:00+07:00' },
  { id: 'TM-260718-0391', channel: 'thaimart', customer: 'Siam Craft', items: 2, total: 1280, status: 'processing', placed_at: '2026-07-18T13:05:00+07:00' },
];

function money(value: number, language: 'en' | 'th'): string {
  return new Intl.NumberFormat(language === 'th' ? 'th-TH' : 'en-GB', { style: 'currency', currency: 'THB' }).format(value);
}

function status_style(status: MockStatus): string {
  if (status === 'delivered') return 'bg-emerald-100 text-emerald-700';
  if (status === 'shipped') return 'bg-sky-100 text-sky-700';
  if (status === 'processing') return 'bg-violet-100 text-violet-700';
  return 'bg-amber-100 text-amber-700';
}

export function MarketplaceView() {
  const { language, t } = useI18n();
  const [filter, set_filter] = useState<Channel>('all');
  const filtered_orders = useMemo(() => filter === 'all' ? mock_orders : mock_orders.filter((order) => order.channel === filter), [filter]);

  return <div className="space-y-6">
    <section className="overflow-hidden rounded-3xl bg-ink p-6 text-white shadow-card sm:p-8">
      <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end"><div><span className="inline-flex rounded-full border border-lime/30 bg-lime/10 px-3 py-1 text-xs font-bold text-lime">{t('marketplace_demo_badge')}</span><h2 className="mt-4 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">{t('marketplace_hero_title')}</h2><p className="mt-3 max-w-2xl leading-7 text-stone-300">{t('marketplace_hero_body')}</p></div><div className="grid grid-cols-2 gap-3"><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-2xl font-extrabold text-lime">0/4</p><p className="mt-1 text-xs text-stone-400">{t('connected_channels')}</p></div><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-2xl font-extrabold text-white">{mock_orders.length}</p><p className="mt-1 text-xs text-stone-400">{t('mock_orders')}</p></div></div></div>
    </section>

    <section className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">{channels.map((channel) => <article key={channel.id} className="rounded-3xl bg-white p-6 shadow-card">
      <div className="flex items-start justify-between gap-4"><div className={`grid size-14 place-items-center rounded-2xl ${channel.tone}`}><img src={channel.logo} alt={`${channel.name} logo`} className="size-8 object-contain" /></div><span className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-amber-700">{t('awaiting_connection')}</span></div>
      <h3 className={`mt-5 text-xl font-extrabold ${channel.accent}`}>{channel.name}</h3><p className="mt-2 text-sm leading-6 text-stone-500">{t(`channel_${channel.id}_hint` as TranslationKey)}</p>
      <div className="mt-5 flex flex-wrap gap-2"><span className="rounded-lg bg-stone-100 px-2.5 py-1 text-[11px] font-bold text-stone-500">{t('order_sync')}</span><span className="rounded-lg bg-stone-100 px-2.5 py-1 text-[11px] font-bold text-stone-500">{t('stock_sync')}</span><span className="rounded-lg bg-stone-100 px-2.5 py-1 text-[11px] font-bold text-stone-500">{t('status_sync')}</span></div>
      <button className="button-secondary mt-6 w-full cursor-not-allowed text-stone-400" disabled>{t('connect_soon')}</button>
    </article>)}</section>

    <section className="overflow-hidden rounded-3xl bg-white shadow-card">
      <div className="flex flex-col justify-between gap-4 border-b p-6 sm:flex-row sm:items-center"><div><h2 className="text-xl font-extrabold">{t('marketplace_orders')}</h2><p className="mt-1 text-sm text-stone-500">{t('marketplace_orders_hint')}</p></div><div className="flex max-w-full gap-2 overflow-x-auto">{(['all', 'shopee', 'lazada', 'tiktok', 'thaimart'] as const).map((channel) => <button key={channel} onClick={() => set_filter(channel)} className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition ${filter === channel ? 'bg-ink text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}>{channel === 'all' ? t('all_channels') : channels.find((item) => item.id === channel)?.name}</button>)}</div></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[840px] text-left text-sm"><thead className="bg-stone-50 text-xs uppercase tracking-wider text-stone-400"><tr><th className="px-6 py-4">{t('marketplace_order_id')}</th><th>{t('channel')}</th><th>{t('customer')}</th><th>{t('items')}</th><th>{t('total')}</th><th>{t('status')}</th><th>{t('received_at')}</th></tr></thead><tbody className="divide-y">{filtered_orders.map((order) => { const channel = channels.find((item) => item.id === order.channel)!; return <tr key={order.id} className="hover:bg-stone-50/70"><td className="px-6 py-4 font-mono text-xs font-bold">{order.id}</td><td><div className="flex items-center gap-2"><img src={channel.logo} alt="" className="size-5 object-contain" /><span className="font-bold">{channel.name}</span></div></td><td>{order.customer}</td><td>{order.items}</td><td className="font-bold">{money(order.total, language)}</td><td><span className={`rounded-full px-3 py-1 text-xs font-bold ${status_style(order.status)}`}>{t(`status_${order.status}` as TranslationKey)}</span></td><td className="text-stone-500">{new Date(order.placed_at).toLocaleString(language === 'th' ? 'th-TH' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</td></tr>; })}</tbody></table></div>
      <div className="border-t bg-amber-50/70 px-6 py-4 text-xs leading-5 text-amber-800"><strong>{t('demo_data')}:</strong> {t('demo_data_note')}</div>
    </section>
  </div>;
}
