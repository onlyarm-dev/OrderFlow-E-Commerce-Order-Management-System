import type { Order, Product } from '../api';

type Props = { products: Product[]; orders: Order[]; api_error: string };

export function Dashboard({ products, orders, api_error }: Props) {
  const low_stock = products.filter((product) => product.quantity - product.reserved_quantity < 10).length;
  const active_orders = orders.filter((order) => !['delivered', 'cancelled'].includes(order.status)).length;
  const revenue = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
  const cards = [
    ['Products', products.length.toLocaleString(), 'Items in catalog', 'bg-lime'],
    ['Active orders', active_orders.toString(), 'Waiting to complete', 'bg-emerald-100'],
    ['Low stock', low_stock.toString(), 'Needs attention', 'bg-orange-100'],
    ['Order value', `฿${revenue.toLocaleString()}`, api_error ? 'API unavailable' : 'Visible orders', 'bg-sky-100'],
  ];

  return (
    <>
      <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, detail, color]) => <article key={label} className="rounded-3xl bg-white p-5 shadow-card"><div className={`mb-5 size-10 rounded-2xl ${color}`} /><p className="text-sm text-stone-500">{label}</p><p className="my-1 font-['Manrope'] text-3xl font-extrabold">{value}</p><p className="text-xs font-medium text-stone-400">{detail}</p></article>)}
      </section>
      <section className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <article className="rounded-3xl bg-white p-6 shadow-card"><h2 className="text-xl font-extrabold">Recent orders</h2><div className="mt-5 space-y-3">{orders.slice(0, 5).map((order) => <div key={order.id} className="flex items-center justify-between rounded-2xl bg-stone-50 p-4"><div><p className="font-mono text-xs text-stone-500">{order.order_number}</p><p className="mt-1 font-bold">฿{Number(order.total_amount).toLocaleString()}</p></div><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold capitalize text-amber-700">{order.status}</span></div>)}{orders.length === 0 && <p className="py-10 text-center text-sm text-stone-400">No orders yet. Create the first order from Orders.</p>}</div></article>
        <article className="rounded-3xl bg-ink p-6 text-white shadow-card"><p className="text-xs font-bold uppercase tracking-widest text-lime">Quick start</p><h2 className="mt-3 text-2xl font-extrabold">Your workspace is live.</h2><p className="mt-3 text-sm leading-6 text-stone-400">Add products, track available stock, and create orders from the sidebar.</p><a href="http://localhost:4000/docs" target="_blank" rel="noreferrer" className="mt-8 inline-block rounded-xl bg-lime px-4 py-3 text-sm font-bold text-ink">Open API docs →</a></article>
      </section>
    </>
  );
}
