import type { Order, Product } from '../api';
import { useI18n, type TranslationKey } from '../i18n';

type Props = { products: Product[]; orders: Order[]; api_error: string };

export function Dashboard({ products, orders, api_error }: Props) {
  const { t } = useI18n();
  const low_stock = products.filter((product) => product.quantity - product.reserved_quantity < 10).length;
  const active_orders = orders.filter((order) => !['delivered', 'cancelled'].includes(order.status)).length;
  const revenue = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
  const cards = [
    [t('products'), products.length.toLocaleString(), t('items_catalog'), 'bg-lime'],
    [t('active_orders'), active_orders.toString(), t('waiting_complete'), 'bg-emerald-100'],
    [t('low_stock'), low_stock.toString(), t('needs_attention'), 'bg-orange-100'],
    [t('order_value'), `฿${revenue.toLocaleString()}`, api_error ? t('api_unavailable') : t('visible_orders'), 'bg-sky-100'],
  ];

  return (
    <>
      <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, detail, color]) => <article key={label} className="rounded-3xl bg-white p-5 shadow-card"><div className={`mb-5 size-10 rounded-2xl ${color}`} /><p className="text-sm text-stone-500">{label}</p><p className="my-1 font-['Manrope'] text-3xl font-extrabold">{value}</p><p className="text-xs font-medium text-stone-400">{detail}</p></article>)}
      </section>
      <section className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <article className="rounded-3xl bg-white p-6 shadow-card"><h2 className="text-xl font-extrabold">{t('recent_orders')}</h2><div className="mt-5 space-y-3">{orders.slice(0, 5).map((order) => <div key={order.id} className="flex items-center justify-between rounded-2xl bg-stone-50 p-4"><div><p className="font-mono text-xs text-stone-500">{order.order_number}</p><p className="mt-1 font-bold">฿{Number(order.total_amount).toLocaleString()}</p></div><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">{t(`status_${order.status}` as TranslationKey)}</span></div>)}{orders.length === 0 && <p className="py-10 text-center text-sm text-stone-400">{t('no_orders_dashboard')}</p>}</div></article>
        <article className="rounded-3xl bg-ink p-6 text-white shadow-card"><p className="text-xs font-bold uppercase tracking-widest text-lime">{t('quick_start')}</p><h2 className="mt-3 text-2xl font-extrabold">{t('workspace_live')}</h2><p className="mt-3 text-sm leading-6 text-stone-400">{t('workspace_body')}</p><a href="http://localhost:4000/docs" target="_blank" rel="noreferrer" className="mt-8 inline-block rounded-xl bg-lime px-4 py-3 text-sm font-bold text-ink">{t('api_docs')}</a></article>
      </section>
    </>
  );
}
