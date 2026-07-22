import { useCallback, useEffect, useState } from 'react';
import { fetch_order, fetch_orders, type AuthSession, type Order, type OrderDetail } from '../api';
import { useI18n, type TranslationKey } from '../i18n';
import { Modal } from './Modal';

type Props = { session: AuthSession; on_close: () => void };

const progress_keys: TranslationKey[] = ['progress_ordered', 'progress_preparing', 'progress_shipped', 'progress_delivered'];

function progress_index(status: Order['status']): number {
  if (status === 'delivered') return 3;
  if (status === 'shipped') return 2;
  if (status === 'confirmed' || status === 'processing') return 1;
  if (status === 'pending') return 0;
  return -1;
}

function status_style(status: Order['status']): string {
  if (status === 'delivered') return 'bg-emerald-100 text-emerald-700';
  if (status === 'shipped') return 'bg-sky-100 text-sky-700';
  if (status === 'cancelled') return 'bg-stone-100 text-stone-500';
  return 'bg-amber-100 text-amber-700';
}

export function CustomerOrders({ session, on_close }: Props) {
  const { language, t } = useI18n();
  const [orders, set_orders] = useState<Order[]>([]);
  const [selected_order, set_selected_order] = useState<OrderDetail | null>(null);
  const [loading, set_loading] = useState(true);
  const [detail_loading, set_detail_loading] = useState(false);
  const [error, set_error] = useState('');

  const money = useCallback((value: string | number) => new Intl.NumberFormat(language === 'th' ? 'th-TH' : 'en-GB', {
    style: 'currency', currency: 'THB',
  }).format(Number(value)), [language]);
  const status_label = useCallback((status: Order['status']) => t(`status_${status}` as TranslationKey), [t]);

  useEffect(() => {
    void fetch_orders(session.access_token)
      .then((result) => { set_orders(result.data); set_error(''); })
      .catch((reason) => set_error(reason instanceof Error ? reason.message : 'Unable to load orders'))
      .finally(() => set_loading(false));
  }, [session.access_token]);

  async function open_detail(order_id: string) {
    set_detail_loading(true);
    set_error('');
    try {
      const result = await fetch_order(order_id, session.access_token);
      set_selected_order(result.data);
    } catch (reason) {
      set_error(reason instanceof Error ? reason.message : 'Unable to load order details');
    } finally {
      set_detail_loading(false);
    }
  }

  function Tracker({ status }: { status: Order['status'] }) {
    const current = progress_index(status);
    return <div className="mt-5">
      {status === 'cancelled' && <p className="rounded-xl bg-stone-100 px-3 py-2 text-center text-sm font-bold text-stone-500">{t('order_cancelled')}</p>}
      {status !== 'cancelled' && <div className="grid grid-cols-4">
        {progress_keys.map((key, index) => {
          const reached = index <= current;
          return <div key={key} className="relative text-center">
            {index > 0 && <span className={`absolute right-1/2 top-3 h-0.5 w-full ${reached ? 'bg-moss' : 'bg-stone-200'}`} />}
            <span className={`relative z-10 mx-auto grid size-6 place-items-center rounded-full text-[10px] font-extrabold ${reached ? 'bg-moss text-white' : 'bg-stone-200 text-stone-400'}`}>{reached ? '✓' : index + 1}</span>
            <p className={`mt-2 text-[10px] font-bold sm:text-xs ${reached ? 'text-ink' : 'text-stone-400'}`}>{t(key)}</p>
          </div>;
        })}
      </div>}
    </div>;
  }

  if (selected_order) return <Modal title={`${t('order_details')} · ${selected_order.order_number}`} on_close={on_close}>
    <div className="space-y-5">
      <div className="rounded-2xl bg-white p-5">
        <div className="flex items-center justify-between gap-3"><span className={`rounded-full px-3 py-1 text-xs font-bold ${status_style(selected_order.status)}`}>{status_label(selected_order.status)}</span><p className="text-xl font-extrabold">{money(selected_order.total_amount)}</p></div>
        <Tracker status={selected_order.status} />
      </div>
      <div className="rounded-2xl bg-white p-4"><p className="mb-3 text-sm font-bold">{t('ordered_items')}</p><div className="divide-y">{selected_order.items.map((item) => <div key={item.id} className="flex items-start justify-between gap-4 py-3"><div><p className="font-bold">{item.product_name}</p><p className="mt-1 text-xs text-stone-400">{item.sku} · {t('quantity')} {item.quantity}</p></div><p className="whitespace-nowrap font-bold">{money(item.line_total)}</p></div>)}</div></div>
      <div className="rounded-2xl bg-white p-4"><p className="mb-2 text-sm font-bold">{t('shipping_address')}</p><p className="font-semibold">{selected_order.shipping_address.name}</p><p className="mt-1 text-sm leading-6 text-stone-500">{selected_order.shipping_address.address_line_1}<br />{selected_order.shipping_address.city} {selected_order.shipping_address.postal_code} · {selected_order.shipping_address.country}</p></div>
      <div className="rounded-2xl bg-white p-4"><p className="mb-4 text-sm font-bold">{t('status_history')}</p><div className="space-y-4">{selected_order.status_history.map((history) => <div key={history.id} className="flex gap-3"><span className="mt-1.5 size-2 shrink-0 rounded-full bg-moss" /><div><p className="text-sm font-bold">{status_label(history.status)}</p><p className="mt-1 text-xs text-stone-400">{new Date(history.created_at).toLocaleString(language === 'th' ? 'th-TH' : 'en-GB')}</p>{history.note && <p className="mt-1 text-sm text-stone-500">{history.note}</p>}</div></div>)}</div></div>
      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <button className="button-secondary w-full" onClick={() => set_selected_order(null)}>{t('back_to_orders')}</button>
    </div>
  </Modal>;

  return <Modal title={t('my_orders')} on_close={on_close}>
    <p className="mb-5 text-sm text-stone-500">{t('my_orders_hint')}</p>
    {loading && <p className="py-12 text-center text-stone-400">{t('loading_orders')}</p>}
    {!loading && error && <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {!loading && !error && orders.length === 0 && <p className="py-12 text-center text-stone-400">{t('no_order_history')}</p>}
    <div className="space-y-4">{orders.map((order) => <article key={order.id} className="rounded-2xl bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-mono text-xs font-bold">{order.order_number}</p><p className="mt-1 text-xs text-stone-400">{t('ordered_on')} {new Date(order.created_at).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-GB')}</p></div><div className="text-right"><span className={`rounded-full px-3 py-1 text-xs font-bold ${status_style(order.status)}`}>{status_label(order.status)}</span><p className="mt-2 font-extrabold">{money(order.total_amount)}</p></div></div>
      <Tracker status={order.status} />
      <button className="mt-5 w-full rounded-xl border px-4 py-2.5 text-sm font-bold text-moss hover:bg-stone-50" disabled={detail_loading} onClick={() => void open_detail(order.id)}>{detail_loading ? t('loading_orders') : t('track_order')}</button>
    </article>)}</div>
  </Modal>;
}
