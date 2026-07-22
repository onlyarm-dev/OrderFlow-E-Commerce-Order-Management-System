import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { create_order, fetch_products, type AuthSession, type Product } from '../api';
import { DemoAccountPicker } from './DemoAccountPicker';
import { CustomerOrders } from './CustomerOrders';
import { Modal } from './Modal';
import { LanguageToggle, useI18n } from '../i18n';

type Props = { session: AuthSession | null; on_auth: (session: AuthSession) => void; on_logout: () => void };
type Cart = Record<string, number>;

function money(value: string | number): string {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(Number(value));
}

function ShopAuth({ checkout, on_close, on_auth }: { checkout: boolean; on_close: () => void; on_auth: (session: AuthSession) => void }) {
  const { t } = useI18n();
  return <Modal title={t(checkout ? 'sign_in_checkout' : 'sign_in_store')} on_close={on_close}><p className="text-sm text-stone-500">{t('choose_demo_account')}</p><DemoAccountPicker on_auth={on_auth} on_complete={on_close} /></Modal>;
}

export function Shop({ session, on_auth, on_logout }: Props) {
  const { t } = useI18n();
  const [products, set_products] = useState<Product[]>([]);
  const [cart, set_cart] = useState<Cart>({});
  const [search, set_search] = useState('');
  const [loading, set_loading] = useState(true);
  const [error, set_error] = useState('');
  const [show_cart, set_show_cart] = useState(false);
  const [show_auth, set_show_auth] = useState(false);
  const [auth_for_checkout, set_auth_for_checkout] = useState(false);
  const [show_checkout, set_show_checkout] = useState(false);
  const [show_orders, set_show_orders] = useState(false);
  const [saving, set_saving] = useState(false);
  const [success_order, set_success_order] = useState('');

  const load_products = useCallback(async () => {
    set_loading(true);
    try {
      const result = await fetch_products(search);
      set_products(result.data.filter((product) => product.status === 'active'));
      set_error('');
    } catch (reason) {
      set_error(reason instanceof Error ? reason.message : 'Unable to load the shop');
    } finally {
      set_loading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load_products(), 250);
    return () => window.clearTimeout(timer);
  }, [load_products]);

  const cart_items = useMemo(() => products.filter((product) => cart[product.id]).map((product) => ({ product, quantity: cart[product.id] ?? 0 })), [cart, products]);
  const cart_count = cart_items.reduce((sum, item) => sum + item.quantity, 0);
  const cart_total = cart_items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);

  function add_to_cart(product: Product) {
    const available = product.quantity - product.reserved_quantity;
    set_cart((current) => ({ ...current, [product.id]: Math.min((current[product.id] ?? 0) + 1, available) }));
  }

  function update_quantity(product: Product, quantity: number) {
    const available = product.quantity - product.reserved_quantity;
    set_cart((current) => {
      const next = { ...current };
      if (quantity <= 0) delete next[product.id];
      else next[product.id] = Math.min(quantity, available);
      return next;
    });
  }

  function start_checkout() {
    if (!session) {
      set_show_cart(false);
      set_auth_for_checkout(true);
      set_show_auth(true);
      return;
    }
    set_show_cart(false);
    set_show_checkout(true);
  }

  async function checkout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) return;
    const data = new FormData(event.currentTarget);
    set_saving(true);
    set_error('');
    try {
      const result = await create_order({
        items: cart_items.map((item) => ({ product_id: item.product.id, quantity: item.quantity })),
        shipping_address: {
          name: String(data.get('name')),
          address_line_1: String(data.get('address_line_1')),
          city: String(data.get('city')),
          postal_code: String(data.get('postal_code')),
          country: String(data.get('country')).toUpperCase(),
        },
      }, session.access_token);
      set_success_order(result.data.order_number);
      set_cart({});
      set_show_checkout(false);
      await load_products();
    } catch (reason) {
      set_error(reason instanceof Error ? reason.message : 'Unable to place order');
    } finally {
      set_saving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] text-ink">
      <header className="sticky top-0 z-30 border-b bg-[#faf9f6]/90 backdrop-blur-xl"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8"><a href="/shop" className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-full bg-ink font-['Manrope'] text-sm font-extrabold text-lime">OA</div><div><p className="font-['Manrope'] text-lg font-extrabold leading-none">ONLYARM</p><p className="mt-1 text-[10px] uppercase tracking-[.25em] text-stone-400">{t('shop_brand_note')}</p></div></a><nav className="hidden items-center gap-8 text-sm font-semibold sm:flex"><a href="#new">{t('shop_new')}</a><a href="#collection">{t('shop_collection_link')}</a>{session?.user.role === 'admin' && <a href="/">{t('manage_store')}</a>}</nav><div className="flex items-center gap-2 sm:gap-3"><LanguageToggle />{session ? <>{session.user.role === 'customer' && <button className="rounded-full border bg-white px-3 py-2 text-xs font-bold text-moss sm:px-4 sm:text-sm" onClick={() => set_show_orders(true)}>{t('my_orders')}</button>}<span className="hidden text-sm text-stone-500 lg:block">{t('hi')}, {session.user.first_name}</span><button className="hidden text-sm font-bold text-moss sm:block" onClick={on_logout}>{t('sign_out')}</button></> : <button className="text-sm font-bold" onClick={() => { set_auth_for_checkout(false); set_show_auth(true); }}>{t('sign_in')}</button>}<button className="relative rounded-full bg-ink px-3 py-2.5 text-xs font-bold text-white sm:px-4 sm:text-sm" onClick={() => set_show_cart(true)}>{t('bag')} <span className="ml-1 text-lime">({cart_count})</span></button></div></div></header>

      <main>
        <section id="new" className="mx-auto grid max-w-7xl gap-8 px-5 pb-16 pt-10 sm:px-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:pb-24 lg:pt-16"><div><p className="mb-5 text-xs font-bold uppercase tracking-[.3em] text-moss">{t('shop_tag')}</p><h1 className="max-w-3xl text-5xl font-extrabold leading-[.98] tracking-[-.05em] sm:text-7xl">{t('shop_title_1')}<br /><span className="text-moss">{t('shop_title_2')}</span></h1><p className="mt-7 max-w-xl text-base leading-7 text-stone-500 sm:text-lg">{t('shop_intro')}</p><a href="#collection" className="mt-8 inline-block rounded-full bg-ink px-7 py-4 text-sm font-bold text-white">{t('shop_cta')}</a></div><div className="relative min-h-80 overflow-hidden rounded-[2.5rem] bg-[#dce9df] p-8 sm:min-h-[440px]"><div className="absolute -right-12 -top-12 size-64 rounded-full border-[40px] border-lime/70" /><div className="absolute bottom-8 left-8 right-8 rounded-3xl bg-white/75 p-6 backdrop-blur"><p className="text-xs font-bold uppercase tracking-widest text-moss">{t('featured')}</p><p className="mt-2 text-2xl font-extrabold">{t('featured_title')}</p><p className="mt-2 text-sm text-stone-500">{t('featured_note')}</p></div></div></section>

        <section id="collection" className="mx-auto max-w-7xl px-5 pb-24 sm:px-8"><div className="mb-8 flex flex-col justify-between gap-5 border-b pb-6 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[.25em] text-moss">{t('shop_all')}</p><h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">{t('collection')}</h2></div><label className="flex items-center rounded-full border bg-white px-5 py-3"><span className="mr-2">⌕</span><input className="w-full bg-transparent text-sm outline-none sm:w-56" placeholder={t('search_shop')} value={search} onChange={(event) => set_search(event.target.value)} /></label></div>
          {error && <p className="rounded-2xl bg-red-50 p-5 text-red-700">{error}</p>}
          {loading && <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"><div className="h-96 animate-pulse rounded-3xl bg-stone-100" /><div className="h-96 animate-pulse rounded-3xl bg-stone-100" /><div className="h-96 animate-pulse rounded-3xl bg-stone-100" /></div>}
          {!loading && !error && <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">{products.map((product, index) => { const available = product.quantity - product.reserved_quantity; const tones = ['bg-[#eee4d6]', 'bg-[#dce9df]', 'bg-[#e5e3ef]', 'bg-[#f1dfda]']; return <article key={product.id} className="group"><div className={`relative grid aspect-[4/4.5] place-items-center overflow-hidden rounded-[2rem] ${tones[index % tones.length]}`}><span className="font-['Manrope'] text-8xl font-extrabold text-white/80 transition duration-500 group-hover:scale-110">{product.name.slice(0, 1).toUpperCase()}</span><span className="absolute left-5 top-5 rounded-full bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">{available > 0 ? `${available} ${t('in_stock')}` : t('sold_out')}</span><button className="absolute bottom-5 right-5 grid size-12 place-items-center rounded-full bg-ink text-xl font-bold text-white shadow-xl transition hover:bg-moss disabled:bg-stone-400" disabled={available === 0} onClick={() => add_to_cart(product)} aria-label={`${t('add_to_bag')} ${product.name}`}>+</button></div><div className="flex items-start justify-between px-1 pt-4"><div><h3 className="text-lg font-extrabold">{product.name}</h3><p className="mt-1 text-sm text-stone-500">{product.description}</p></div><p className="ml-4 whitespace-nowrap font-bold">{money(product.price)}</p></div></article>; })}</div>}
          {!loading && !error && products.length === 0 && <p className="py-20 text-center text-stone-400">{t('no_shop_products')}</p>}
        </section>
      </main>

      <footer className="bg-ink px-5 py-12 text-white"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 sm:flex-row"><div><p className="font-['Manrope'] text-2xl font-extrabold">ONLYARM</p><p className="mt-2 text-sm text-stone-400">{t('shop_footer')}</p></div><div className="text-sm text-stone-400"><p>Bangkok, Thailand</p><p className="mt-2">© 2026 Onlyarm Studio</p></div></div></footer>

      {show_cart && <Modal title={`${t('your_bag')} (${cart_count})`} on_close={() => set_show_cart(false)}><div className="space-y-3">{cart_items.map(({ product, quantity }) => <div key={product.id} className="flex items-center gap-4 rounded-2xl bg-white p-4"><div className="grid size-14 place-items-center rounded-xl bg-stone-100 text-xl font-extrabold">{product.name.slice(0, 1)}</div><div className="min-w-0 flex-1"><p className="truncate font-bold">{product.name}</p><p className="text-sm text-stone-500">{money(product.price)}</p></div><div className="flex items-center rounded-full border"><button className="px-3 py-1.5" onClick={() => update_quantity(product, quantity - 1)} aria-label={`Decrease ${product.name}`}>−</button><span className="min-w-6 text-center text-sm font-bold">{quantity}</span><button className="px-3 py-1.5" onClick={() => update_quantity(product, quantity + 1)} aria-label={`Increase ${product.name}`}>+</button></div></div>)}{cart_items.length === 0 && <p className="py-12 text-center text-stone-400">{t('empty_bag')}</p>}</div>{cart_items.length > 0 && <div className="mt-6 border-t pt-5"><div className="mb-5 flex justify-between text-lg font-extrabold"><span>{t('total')}</span><span>{money(cart_total)}</span></div><button className="button-primary w-full" onClick={start_checkout}>{t('checkout')}</button></div>}</Modal>}
      {show_auth && <ShopAuth checkout={auth_for_checkout} on_close={() => set_show_auth(false)} on_auth={on_auth} />}
      {show_orders && session?.user.role === 'customer' && <CustomerOrders session={session} on_close={() => set_show_orders(false)} />}
      {show_checkout && session && <Modal title={t('shipping_checkout')} on_close={() => set_show_checkout(false)}><div className="mb-5 rounded-2xl bg-white p-4"><div className="flex justify-between font-bold"><span>{cart_count} {t('items')}</span><span>{money(cart_total)}</span></div></div><form className="space-y-3" onSubmit={(event) => void checkout(event)}><input className="field" name="name" placeholder={t('recipient_name')} defaultValue={`${session.user.first_name} ${session.user.last_name}`} required /><input className="field" name="address_line_1" placeholder={t('address_line')} required /><div className="grid grid-cols-2 gap-3"><input className="field" name="city" placeholder={t('city')} required /><input className="field" name="postal_code" placeholder={t('postal_code')} required /></div><input className="field" name="country" placeholder={t('country_code')} defaultValue="TH" minLength={2} maxLength={2} required />{error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<button className="button-primary w-full" disabled={saving}>{saving ? t('placing_order') : `${t('place_order')} · ${money(cart_total)}`}</button></form></Modal>}
      {success_order && <Modal title={t('order_confirmed')} on_close={() => set_success_order('')}><div className="py-6 text-center"><div className="mx-auto grid size-16 place-items-center rounded-full bg-lime text-2xl">✓</div><h3 className="mt-5 text-2xl font-extrabold">{t('thank_you')}</h3><p className="mt-2 text-stone-500">{t('received_order')} <strong className="font-mono text-ink">{success_order}</strong>.</p><div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><button className="button-secondary" onClick={() => set_success_order('')}>{t('continue_shopping')}</button><button className="button-primary" onClick={() => { set_success_order(''); set_show_orders(true); }}>{t('track_order')}</button></div></div></Modal>}
    </div>
  );
}
