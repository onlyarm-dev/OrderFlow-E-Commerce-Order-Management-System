import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { create_order, fetch_orders, type AuthSession, type Order, type Product } from '../api';
import { Modal } from './Modal';
import { useI18n, type TranslationKey } from '../i18n';

type Props = {
  session: AuthSession;
  products: Product[];
  on_orders_change: (orders: Order[]) => void;
  on_order_created: () => Promise<void>;
};

export function OrdersView({ session, products, on_orders_change, on_order_created }: Props) {
  const { language, t } = useI18n();
  const [orders, set_orders] = useState<Order[]>([]);
  const [loading, set_loading] = useState(true);
  const [show_form, set_show_form] = useState(false);
  const [saving, set_saving] = useState(false);
  const [error, set_error] = useState('');

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
      await load_orders();
      await on_order_created();
    } catch (reason) {
      set_error(reason instanceof Error ? reason.message : 'Unable to create order');
    } finally {
      set_saving(false);
    }
  }

  return (
    <>
      <section className="overflow-hidden rounded-3xl bg-white shadow-card">
        <div className="flex items-center justify-between border-b p-6"><div><h2 className="text-xl font-extrabold">{t('orders')}</h2><p className="mt-1 text-sm text-stone-500">{t('track_orders')}</p></div><button className="button-primary" onClick={() => set_show_form(true)} disabled={products.length === 0}>{t('new_order')}</button></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-stone-50 text-xs uppercase tracking-wider text-stone-400"><tr><th className="px-6 py-4">{t('order')}</th><th>{t('created')}</th><th>{t('ship_to')}</th><th>{t('total')}</th><th>{t('status')}</th></tr></thead><tbody className="divide-y">{loading && <tr><td colSpan={5} className="px-6 py-12 text-center text-stone-400">{t('loading_orders')}</td></tr>}{!loading && error && <tr><td colSpan={5} className="px-6 py-12 text-center text-coral">{error}</td></tr>}{!loading && !error && orders.length === 0 && <tr><td colSpan={5} className="px-6 py-12 text-center text-stone-400">{t('no_orders')}</td></tr>}{!loading && orders.map((order) => <tr key={order.id}><td className="px-6 py-4 font-mono text-xs font-bold">{order.order_number}</td><td>{new Date(order.created_at).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-GB')}</td><td><p className="font-semibold">{order.shipping_address.name}</p><p className="text-xs text-stone-400">{order.shipping_address.city}</p></td><td className="font-bold">฿{Number(order.total_amount).toLocaleString()}</td><td><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">{t(`status_${order.status}` as TranslationKey)}</span></td></tr>)}</tbody></table></div>
      </section>

      {show_form && <Modal title={t('create_order')} on_close={() => set_show_form(false)}><form className="space-y-4" onSubmit={(event) => void submit(event)}><div className="rounded-2xl bg-white p-4"><p className="mb-3 text-sm font-bold">{t('order_item')}</p><div className="grid gap-3 sm:grid-cols-[1fr_110px]"><select className="field" name="product_id" required defaultValue=""><option value="" disabled>{t('select_product')}</option>{products.filter((product) => product.quantity > product.reserved_quantity).map((product) => <option key={product.id} value={product.id}>{product.name} — ฿{Number(product.price).toLocaleString()}</option>)}</select><input className="field" name="quantity" type="number" min="1" step="1" defaultValue="1" required /></div></div><div className="rounded-2xl bg-white p-4"><p className="mb-3 text-sm font-bold">{t('shipping_address')}</p><div className="space-y-3"><input className="field" name="name" placeholder={t('recipient_name')} defaultValue={`${session.user.first_name} ${session.user.last_name}`} required /><input className="field" name="address_line_1" placeholder={t('address_line')} required /><div className="grid gap-3 sm:grid-cols-2"><input className="field" name="city" placeholder={t('city')} required /><input className="field" name="postal_code" placeholder={t('postal_code')} required /></div><input className="field" name="country" placeholder={t('country_code')} defaultValue="TH" minLength={2} maxLength={2} required /></div></div>{error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<div className="flex justify-end gap-3"><button type="button" className="button-secondary" onClick={() => set_show_form(false)}>{t('cancel')}</button><button className="button-primary" disabled={saving}>{saving ? t('creating') : t('create_order')}</button></div></form></Modal>}
    </>
  );
}
