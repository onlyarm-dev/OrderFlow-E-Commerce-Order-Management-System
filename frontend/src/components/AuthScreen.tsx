import type { AuthSession } from '../api';
import { LanguageToggle, useI18n } from '../i18n';
import { DemoAccountPicker } from './DemoAccountPicker';

type Props = { on_auth: (session: AuthSession) => void };

export function AuthScreen({ on_auth }: Props) {
  const { t } = useI18n();

  return (
    <main className="grid min-h-screen bg-ink lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden overflow-hidden p-14 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -left-24 top-1/3 size-96 rounded-full bg-lime/10 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-xl bg-lime font-extrabold">OA</div>
          <div><p className="font-['Manrope'] text-xl font-extrabold text-white">Onlyarm</p><p className="text-xs text-stone-400">Order Management System</p></div>
        </div>
        <div className="relative max-w-xl">
          <p className="mb-5 text-sm font-bold uppercase tracking-[.25em] text-lime">{t('auth_hero_tag')}</p>
          <h1 className="text-5xl font-extrabold leading-tight text-white xl:text-6xl">{t('auth_hero_title')}</h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-stone-400">{t('auth_hero_body')}</p>
        </div>
        <p className="relative text-xs text-stone-500">Onlyarm OMS · Enterprise foundation</p>
      </section>

      <section className="flex items-center justify-center bg-canvas px-5 py-12 sm:px-10">
        <div className="w-full max-w-md rounded-[2rem] bg-white p-7 shadow-card sm:p-10">
          <div className="mb-8 lg:hidden"><div className="grid size-11 place-items-center rounded-xl bg-lime font-extrabold">OA</div></div>
          <div className="mb-5 flex justify-end"><LanguageToggle /></div>
          <p className="mb-2 text-sm font-bold uppercase tracking-widest text-moss">{t('welcome')}</p>
          <h2 className="text-3xl font-extrabold">{t('sign_in_store')}</h2>
          <p className="mt-2 text-sm text-stone-500">{t('sign_in_hint')}</p>

          <DemoAccountPicker on_auth={on_auth} />
          <a href="/shop" className="mt-4 block text-center text-sm font-bold text-moss">{t('visit_store')}</a>
        </div>
      </section>
    </main>
  );
}
