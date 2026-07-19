import { useState, type FormEvent } from 'react';
import { login, register, type AuthSession } from '../api';

type Props = { on_auth: (session: AuthSession) => void };

export function AuthScreen({ on_auth }: Props) {
  const [mode, set_mode] = useState<'login' | 'register'>('login');
  const [loading, set_loading] = useState(false);
  const [error, set_error] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    set_loading(true);
    set_error('');
    try {
      const email = String(data.get('email'));
      const password = String(data.get('password'));
      const session = mode === 'login'
        ? await login(email, password)
        : await register({
            email,
            password,
            first_name: String(data.get('first_name')),
            last_name: String(data.get('last_name')),
          });
      on_auth(session);
    } catch (reason) {
      set_error(reason instanceof Error ? reason.message : 'Unable to continue');
    } finally {
      set_loading(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-ink lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden overflow-hidden p-14 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -left-24 top-1/3 size-96 rounded-full bg-lime/10 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-xl bg-lime font-extrabold">OA</div>
          <div><p className="font-['Manrope'] text-xl font-extrabold text-white">Onlyarm</p><p className="text-xs text-stone-400">Order Management System</p></div>
        </div>
        <div className="relative max-w-xl">
          <p className="mb-5 text-sm font-bold uppercase tracking-[.25em] text-lime">One clear operation</p>
          <h1 className="font-['Manrope'] text-5xl font-extrabold leading-tight text-white xl:text-6xl">Orders, inventory, and customers—together.</h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-stone-400">A focused workspace for keeping stock accurate and every order moving.</p>
        </div>
        <p className="relative text-xs text-stone-500">Onlyarm OMS · Enterprise foundation</p>
      </section>

      <section className="flex items-center justify-center bg-canvas px-5 py-12 sm:px-10">
        <div className="w-full max-w-md rounded-[2rem] bg-white p-7 shadow-card sm:p-10">
          <div className="mb-8 lg:hidden"><div className="grid size-11 place-items-center rounded-xl bg-lime font-extrabold">OA</div></div>
          <p className="mb-2 text-sm font-bold uppercase tracking-widest text-moss">Welcome</p>
          <h2 className="text-3xl font-extrabold">{mode === 'login' ? 'Sign in to your store' : 'Create your account'}</h2>
          <p className="mt-2 text-sm text-stone-500">{mode === 'login' ? 'Use your account to manage daily operations.' : 'New accounts start with customer access.'}</p>

          <form className="mt-8 space-y-4" onSubmit={(event) => void submit(event)}>
            {mode === 'register' && <div className="grid grid-cols-2 gap-3"><input className="field" name="first_name" placeholder="First name" required /><input className="field" name="last_name" placeholder="Last name" required /></div>}
            <input className="field" name="email" type="email" placeholder="Email address" autoComplete="email" required />
            <input className="field" name="password" type="password" placeholder="Password" minLength={8} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required />
            {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}
            <button className="button-primary w-full" disabled={loading}>{loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
          </form>

          <button className="mt-6 w-full text-sm font-semibold text-moss" onClick={() => { set_mode(mode === 'login' ? 'register' : 'login'); set_error(''); }}>
            {mode === 'login' ? 'New here? Create an account' : 'Already have an account? Sign in'}
          </button>
          <a href="/shop" className="mt-4 block text-center text-sm font-bold text-moss">Visit the storefront →</a>
        </div>
      </section>
    </main>
  );
}
