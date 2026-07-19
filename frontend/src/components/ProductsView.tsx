import { useState, type FormEvent } from 'react';
import { create_product, type AuthSession, type Product } from '../api';
import { Modal } from './Modal';

type Props = {
  session: AuthSession;
  products: Product[];
  loading: boolean;
  error: string;
  search: string;
  set_search: (value: string) => void;
  reload: () => Promise<void>;
};

function money(value: string): string {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(Number(value));
}

export function ProductsView({ session, products, loading, error, search, set_search, reload }: Props) {
  const [show_form, set_show_form] = useState(false);
  const [saving, set_saving] = useState(false);
  const [form_error, set_form_error] = useState('');
  const can_manage = session.user.role === 'admin' || session.user.role === 'staff';

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    set_saving(true);
    set_form_error('');
    try {
      await create_product({
        sku: String(data.get('sku')),
        name: String(data.get('name')),
        description: String(data.get('description')),
        price: Number(data.get('price')),
        quantity: Number(data.get('quantity')),
      }, session.access_token);
      set_show_form(false);
      await reload();
    } catch (reason) {
      set_form_error(reason instanceof Error ? reason.message : 'Unable to create product');
    } finally {
      set_saving(false);
    }
  }

  return (
    <>
      <section className="overflow-hidden rounded-3xl bg-white shadow-card">
        <div className="flex flex-col justify-between gap-4 border-b p-5 sm:flex-row sm:items-center sm:p-6">
          <div><h2 className="text-xl font-extrabold">Product inventory</h2><p className="mt-1 text-sm text-stone-500">Live stock availability from PostgreSQL</p></div>
          <div className="flex gap-3"><label className="flex items-center gap-2 rounded-xl border bg-stone-50 px-4 py-2.5 text-sm focus-within:border-moss"><span>⌕</span><input className="w-full bg-transparent outline-none sm:w-48" value={search} onChange={(event) => set_search(event.target.value)} placeholder="Search products" /></label>{can_manage && <button className="button-primary whitespace-nowrap" onClick={() => set_show_form(true)}>+ Add product</button>}</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-stone-50 text-xs uppercase tracking-wider text-stone-400"><tr><th className="px-6 py-4">Product</th><th>SKU</th><th>Price</th><th>Available</th><th>Reserved</th><th>Status</th></tr></thead>
            <tbody className="divide-y">
              {loading && <tr><td colSpan={6} className="px-6 py-12 text-center text-stone-400">Loading inventory…</td></tr>}
              {!loading && error && <tr><td colSpan={6} className="px-6 py-12 text-center text-coral">{error}</td></tr>}
              {!loading && !error && products.length === 0 && <tr><td colSpan={6} className="px-6 py-12 text-center text-stone-400">No products found.{can_manage ? ' Add the first product.' : ''}</td></tr>}
              {!loading && products.map((product) => {
                const available = product.quantity - product.reserved_quantity;
                return <tr key={product.id} className="transition hover:bg-stone-50/70"><td className="px-6 py-4"><div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-stone-100 font-bold text-moss">{product.name.slice(0, 1).toUpperCase()}</div><div><p className="font-semibold">{product.name}</p><p className="max-w-64 truncate text-xs text-stone-400">{product.description}</p></div></div></td><td className="font-mono text-xs text-stone-500">{product.sku}</td><td className="font-semibold">{money(product.price)}</td><td className={available < 10 ? 'font-bold text-coral' : 'font-semibold'}>{available}</td><td className="text-stone-500">{product.reserved_quantity}</td><td><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${product.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>{product.status}</span></td></tr>;
              })}
            </tbody>
          </table>
        </div>
      </section>

      {show_form && <Modal title="Add product" on_close={() => set_show_form(false)}><form className="space-y-4" onSubmit={(event) => void submit(event)}><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">SKU<input className="field mt-2" name="sku" placeholder="OA-SKU-001" required /></label><label className="text-sm font-semibold">Product name<input className="field mt-2" name="name" placeholder="Product name" required /></label></div><label className="block text-sm font-semibold">Description<textarea className="field mt-2 min-h-24 resize-y" name="description" placeholder="Short product description" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">Price (THB)<input className="field mt-2" name="price" type="number" min="0" step="0.01" required /></label><label className="text-sm font-semibold">Initial quantity<input className="field mt-2" name="quantity" type="number" min="0" step="1" required /></label></div>{form_error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{form_error}</p>}<div className="flex justify-end gap-3 pt-2"><button type="button" className="button-secondary" onClick={() => set_show_form(false)}>Cancel</button><button className="button-primary" disabled={saving}>{saving ? 'Saving…' : 'Create product'}</button></div></form></Modal>}
    </>
  );
}
