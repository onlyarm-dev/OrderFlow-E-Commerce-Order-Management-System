import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  create_order,
  fetch_order,
  fetch_orders,
  update_order_status,
  type AuthSession,
  type Order,
  type OrderDetail,
  type Product,
} from '../api';
import { useI18n, type TranslationKey } from '../i18n';
import { Modal } from './Modal';

type Props = {
  session: AuthSession;
  products: Product[];
  on_orders_change: (orders: Order[]) => void;
  on_order_created: () => Promise<void>;
};

function money(value: string | number): string {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(Number(value));
}

function status_style(status: Order['status']): string {
  if (status === 'delivered') return 'bg-emerald-100 text-emerald-700';
  if (status === 'shipped') return 'bg-sky-100 text-sky-700';
  if (status === 'cancelled') return 'bg-stone-100 text-stone-500';
  return 'bg-amber-100 text-amber-700';
}

export function OrdersView({ session, products, on_orders_change, on_order_created }: Props) {
  const { language, t } = useI18n();
  const [orders, set_orders] = useState<Order[]>([]);
  const [selected_order, set_selected_order] = useState<OrderDetail | null>(null);
  const [loading, set_loading] = useState(true);
  const [detail_loading, set_detail_loading] = useState(false);
  const [status_loading, set_status_loading] = useState(false);
  const [show_form, set_show_form] = useState(false);
  const [saving, set_saving] = useState(false);
  const [error, set_error] = useState('');
  const can_manage = session.user.role === 'admin' || session.user.role === 'staff';

  const status_label = useCallback((status: Order['status']) => t(`status_${status}` as TranslationKey), [t]);

  const load_orders = useCallback(async () => {
    set_loading(true);
    try {
      const result = await fetch_orders(session.access_token);
      set_orders(result.data);
      on_orders_change(result.data);
      set_error('');
    } catch (reason) {
      set_error(reason instanceof Error ? reason.message : 'Unable to load orders');
    } finally {
      set_loading(false);
    }
  }, [session.access_token, on_orders_change]);

  useEffect(() => { void load_orders(); }, [load_orders]);

  async function view_order(order_id: string) {
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

  async function change_status(status: 'shipped' | 'delivered') {
    if (!selected_order) return;
    set_status_loading(true);
    set_error('');
    try {
      await update_order_status(selected_order.id, status, session.access_token);
      await Promise.all([load_orders(), on_order_created()]);
      const result = await fetch_order(selected_order.id, session.access_token);
      set_selected_order(result.data);
    } catch (reason) {
      set_error(reason instanceof Error ? reason.message : 'Unable to update order status');
    } finally {
      set_status_loading(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    set_saving(true);
    set_error('');
    try {
      await create_order({
        items: [{ product_id: String(data.get('product_id')), quantity: Number(data.get('quantity')) }],
        shipping_address: {
          name: String(data.get('name')),
          address_line_1: String(data.get('address_line_1')),
          city: String(data.get('city')),
          postal_code: String(data.get('postal_code')),
          country: String(data.get('country')).toUpperCase(),
        },
      }, session.access_token);
      set_show_form(false);
      await Promise.all([load_orders(), on_order_created()]);
    } catch (reason) {
      set_error(reason instanceof Error ? reason.message : 'Unable to create order');
    } finally {
      set_saving(false);
    }
  }

  return (
    <>
      <section className="overflow-hidden rounded-3xl bg-white shadow-card">
        <div className="flex items-center justify-between border-b p-6">
          <div><h2 className="text-xl font-extrabold">{t('orders')}</h2><p className="mt-1 text-sm text-stone-500">{t('track_orders')}</p></div>
          <button className="button-primary" onClick={() => set_show_form(true)} disabled={products.length === 0}>{t('new_order')}</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px] text-left text-sm">
            <thead className="bg-stone-50 text-xs uppercase tracking-wider text-stone-400"><tr><th className="px-6 py-4">{t('order')}</th><th>{t('created')}</th><th>{t('ship_to')}</th><th>{t('total')}</th><th>{t('status')}</th><th>{t('actions')}</th></tr></thead>
            <tbody className="divide-y">
              {loading && <tr><td colSpan={6} className="px-6 py-12 text-center text-stone-400">{t('loading_orders')}</td></tr>}
              {!loading && error && !selected_order && <tr><td colSpan={6} className="px-6 py-12 text-center text-coral">{error}</td></tr>}
              {!loading && !error && orders.length === 0 && <tr><td colSpan={6} className="px-6 py-12 text-center text-stone-400">{t('no_orders')}</td></tr>}
              {!loading && orders.map((order) => <tr key={order.id} className="hover:bg-stone-50/70"><td className="px-6 py-4 font-mono text-xs font-bold">{order.order_number}</td><td>{new Date(order.created_at).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-GB')}</td><td><p className="font-semibold">{order.shipping_address.name}</p><p className="text-xs text-stone-400">{order.shipping_address.city}</p></td><td className="font-bold">{money(order.total_amount)}</td><td><span className={`rounded-full px-3 py-1 text-xs font-bold ${status_style(order.status)}`}>{status_label(order.status)}</span></td><td><button className="rounded-lg border px-3 py-2 text-xs font-bold text-moss hover:bg-stone-50" onClick={() => void view_order(order.id)}>{t('view_details')}</button></td></tr>)}
            </tbody>
          </table>
        </div>
      </section>

      {detail_loading && <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50"><div className="rounded-2xl bg-white px-6 py-4 font-bold">{t('loading_orders')}</div></div>}

      {selected_order && <Modal title={`${t('order_details')} · ${selected_order.order_number}`} on_close={() => { set_selected_order(null); set_error(''); }}>
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4"><div><p className="text-xs font-bold uppercase tracking-wider text-stone-400">{t('status')}</p><span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold ${status_style(selected_order.status)}`}>{status_label(selected_order.status)}</span></div><p className="text-2xl font-extrabold">{money(selected_order.total_amount)}</p></div>

          <div className="grid gap-4 sm:grid-cols-2"><div className="rounded-2xl bg-white p-4"><p className="mb-2 text-xs font-bold uppercase tracking-wider text-stone-400">{t('customer')}</p><p className="font-bold">{selected_order.customer_first_name} {selected_order.customer_last_name}</p><p className="mt-1 text-sm text-stone-500">{selected_order.customer_email}</p></div><div className="rounded-2xl bg-white p-4"><p className="mb-2 text-xs font-bold uppercase tracking-wider text-stone-400">{t('shipping_address')}</p><p className="font-bold">{selected_order.shipping_address.name}</p><p className="mt-1 text-sm leading-6 text-stone-500">{selected_order.shipping_address.address_line_1}<br />{selected_order.shipping_address.city} {selected_order.shipping_address.postal_code} · {selected_order.shipping_address.country}</p></div></div>

          <div className="overflow-hidden rounded-2xl bg-white"><p className="border-b px-4 py-3 text-sm font-bold">{t('ordered_items')}</p><div className="overflow-x-auto"><table className="w-full min-w-[480px] text-left text-sm"><thead className="bg-stone-50 text-xs text-stone-400"><tr><th className="px-4 py-3">{t('product')}</th><th>{t('quantity')}</th><th>{t('unit_price')}</th><th>{t('subtotal')}</th></tr></thead><tbody className="divide-y">{selected_order.items.map((item) => <tr key={item.id}><td className="px-4 py-3"><p className="font-bold">{item.product_name}</p><p className="font-mono text-xs text-stone-400">{item.sku}</p></td><td>{item.quantity}</td><td>{money(item.unit_price)}</td><td className="font-bold">{money(item.line_total)}</td></tr>)}</tbody></table></div></div>

          <div className="rounded-2xl bg-white p-4"><p className="mb-4 text-sm font-bold">{t('status_history')}</p><div className="space-y-4">{selected_order.status_history.map((history) => <div key={history.id} className="flex gap-3"><div className="mt-1 size-2 shrink-0 rounded-full bg-moss" /><div><p className="text-sm font-bold">{status_label(history.status)}</p><p className="text-xs text-stone-400">{new Date(history.created_at).toLocaleString(language === 'th' ? 'th-TH' : 'en-GB')}{history.changed_by_first_name ? ` · ${t('changed_by')} ${history.changed_by_first_name} ${history.changed_by_last_name ?? ''}` : ''}</p>{history.note && <p className="mt-1 text-sm text-stone-500">{history.note}</p>}</div></div>)}</div></div>

          {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <div className="flex flex-wrap justify-end gap-3 border-t pt-5"><button className="button-secondary" onClick={() => set_selected_order(null)}>{t('close')}</button>{can_manage && ['pending', 'confirmed', 'processing'].includes(selected_order.status) && <button className="button-primary" disabled={status_loading} onClick={() => void change_status('shipped')}>{status_loading ? t('updating_status') : t('mark_shipped')}</button>}{can_manage && selected_order.status === 'shipped' && <button className="button-primary" disabled={status_loading} onClick={() => void change_status('delivered')}>{status_loading ? t('updating_status') : t('mark_delivered')}</button>}</div>
        </div>
      </Modal>}

      {show_form && <Modal title={t('create_order')} on_close={() => set_show_form(false)}><form className="space-y-4" onSubmit={(event) => void submit(event)}><div className="rounded-2xl bg-white p-4"><p className="mb-3 text-sm font-bold">{t('order_item')}</p><div className="grid gap-3 sm:grid-cols-[1fr_110px]"><select className="field" name="product_id" required defaultValue=""><option value="" disabled>{t('select_product')}</option>{products.filter((product) => product.quantity > product.reserved_quantity).map((product) => <option key={product.id} value={product.id}>{product.name} — {money(product.price)}</option>)}</select><input className="field" name="quantity" type="number" min="1" step="1" defaultValue="1" required /></div></div><div className="rounded-2xl bg-white p-4"><p className="mb-3 text-sm font-bold">{t('shipping_address')}</p><div className="space-y-3"><input className="field" name="name" placeholder={t('recipient_name')} defaultValue={`${session.user.first_name} ${session.user.last_name}`} required /><input className="field" name="address_line_1" placeholder={t('address_line')} required /><div className="grid gap-3 sm:grid-cols-2"><input className="field" name="city" placeholder={t('city')} required /><input className="field" name="postal_code" placeholder={t('postal_code')} required /></div><input className="field" name="country" placeholder={t('country_code')} defaultValue="TH" minLength={2} maxLength={2} required /></div></div>{error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<div className="flex justify-end gap-3"><button type="button" className="button-secondary" onClick={() => set_show_form(false)}>{t('cancel')}</button><button className="button-primary" disabled={saving}>{saving ? t('creating') : t('create_order')}</button></div></form></Modal>}
    </>
  );
}
