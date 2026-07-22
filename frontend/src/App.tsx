import { useCallback, useEffect, useState } from 'react';
import { fetch_orders, fetch_products, type AuthSession, type Order, type Product } from './api';
import { AuthScreen } from './components/AuthScreen';
import { Dashboard } from './components/Dashboard';
import { OrdersView } from './components/OrdersView';
import { MarketplaceView } from './components/MarketplaceView';
import { ProductsView } from './components/ProductsView';
import { Shop } from './components/Shop';
import { LanguageToggle, useI18n } from './i18n';

type View = 'dashboard' | 'products' | 'orders' | 'marketplace';

function restore_session(): AuthSession | null {
  try {
    const stored = sessionStorage.getItem('onlyarm_session');
    return stored ? JSON.parse(stored) as AuthSession : null;
  } catch {
    return null;
  }
}

export default function App() {
  const { t } = useI18n();
  const [session, set_session] = useState<AuthSession | null>(restore_session);
  const [view, set_view] = useState<View>('dashboard');
  const [products, set_products] = useState<Product[]>([]);
  const [orders, set_orders] = useState<Order[]>([]);
  const [search, set_search] = useState('');
  const [loading_products, set_loading_products] = useState(false);
  const [api_error, set_api_error] = useState('');

  const load_products = useCallback(async () => {
    set_loading_products(true);
    try {
      const result = await fetch_products(search);
      set_products(result.data);
      set_api_error('');
    } catch (reason) {
      set_api_error(reason instanceof Error ? reason.message : 'Unable to load products');
    } finally {
      set_loading_products(false);
    }
  }, [search]);

  useEffect(() => {
    if (!session) return;
    const timer = window.setTimeout(() => void load_products(), 250);
    return () => window.clearTimeout(timer);
  }, [session, load_products]);

  useEffect(() => {
    if (!session) return;
    void fetch_orders(session.access_token).then((result) => set_orders(result.data)).catch(() => undefined);
  }, [session]);

  function authenticate(next_session: AuthSession) {
    sessionStorage.setItem('onlyarm_session', JSON.stringify(next_session));
    const destination = next_session.user.role === 'admin' ? '/' : '/shop';
    if (window.location.pathname !== destination) {
      window.history.replaceState({}, '', destination);
    }
    set_session(next_session);
  }

  function logout() {
    sessionStorage.removeItem('onlyarm_session');
    if (window.location.pathname !== '/') {
      window.history.replaceState({}, '', '/');
    }
    set_session(null);
    set_products([]);
    set_orders([]);
    set_view('dashboard');
  }

  if (window.location.pathname.startsWith('/shop') || (session && session.user.role !== 'admin')) return <Shop session={session} on_auth={authenticate} on_logout={logout} />;
  if (!session) return <AuthScreen on_auth={authenticate} />;

  const nav_items: { id: View; label: string; icon: string }[] = [
    { id: 'dashboard', label: t('dashboard'), icon: '⌂' },
    { id: 'orders', label: t('orders'), icon: '□' },
    { id: 'products', label: t('products'), icon: '◇' },
    { id: 'marketplace', label: t('marketplace'), icon: '◎' },
  ];
  const title = view === 'dashboard' ? `${t('morning')}, ${session.user.first_name}.` : view === 'products' ? t('products_title') : view === 'orders' ? t('orders_title') : t('marketplace_title');
  const subtitle = view === 'dashboard' ? t('dashboard_hint') : view === 'products' ? t('products_hint') : view === 'orders' ? t('orders_hint') : t('marketplace_hint');
  const section_label = view === 'dashboard' ? t('dashboard') : view === 'products' ? t('products') : view === 'orders' ? t('orders') : t('marketplace');
  const role_label = t(`role_${session.user.role}`);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="hidden min-h-screen bg-ink p-5 lg:flex lg:flex-col">
        <div className="mb-10 flex items-center gap-3 px-2 pt-2"><div className="grid size-10 place-items-center rounded-xl bg-lime font-bold text-ink">OA</div><div><p className="font-['Manrope'] text-lg font-extrabold text-white">Onlyarm</p><p className="text-xs text-stone-400">Order management</p></div></div>
        <nav className="space-y-1">{nav_items.map((item) => <button key={item.id} className={`nav-item w-full ${view === item.id ? 'active' : ''}`} onClick={() => set_view(item.id)}><span className="text-lg">{item.icon}</span>{item.label}</button>)}</nav>
        <div className="mt-auto"><div className="mb-3"><LanguageToggle dark /></div><a href="/shop" className="nav-item mb-3 w-full"><span>↗</span> {t('open_store')}</a><div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-sm font-semibold text-white">{session.user.first_name} {session.user.last_name}</p><p className="mt-1 text-xs text-stone-400">{role_label} · {session.user.email}</p></div><button className="nav-item w-full" onClick={logout}><span>↪</span> {t('sign_out')}</button></div>
      </aside>

      <main className="min-w-0 px-5 py-6 sm:px-8 lg:px-10 lg:py-9">
        <div className="mb-5 flex gap-2 overflow-x-auto lg:hidden">{nav_items.map((item) => <button key={item.id} className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-bold ${view === item.id ? 'bg-ink text-white' : 'bg-white'}`} onClick={() => set_view(item.id)}>{item.label}</button>)}<LanguageToggle /><button className="ml-auto rounded-xl bg-white px-4 py-2 text-sm" onClick={logout}>{t('sign_out')}</button></div>
        <header className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-center"><div><p className="mb-1 text-sm font-semibold uppercase tracking-wider text-moss">{section_label}</p><h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1><p className="mt-2 text-stone-500">{subtitle}</p></div><div className="flex items-center gap-3 self-start rounded-2xl bg-white p-2 pr-4 shadow-card"><div className="grid size-10 place-items-center rounded-xl bg-coral font-bold text-white">{session.user.first_name.slice(0, 1).toUpperCase()}</div><div><p className="text-sm font-bold">{session.user.first_name}</p><p className="text-xs text-stone-500">{role_label}</p></div></div></header>

        {view === 'dashboard' && <Dashboard products={products} orders={orders} api_error={api_error} />}
        {view === 'products' && <ProductsView session={session} products={products} loading={loading_products} error={api_error} search={search} set_search={set_search} reload={load_products} />}
        {view === 'orders' && <OrdersView session={session} products={products} on_orders_change={set_orders} on_order_created={load_products} />}
        {view === 'marketplace' && <MarketplaceView />}
      </main>
    </div>
  );
}
