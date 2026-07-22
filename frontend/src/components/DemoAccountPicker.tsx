import { useState } from 'react';
import { login, type AuthSession, type User } from '../api';
import { useI18n } from '../i18n';

type DemoRole = Extract<User['role'], 'admin' | 'customer'>;
type Props = {
  on_auth: (session: AuthSession) => void;
  on_complete?: () => void;
};

const demo_accounts: Record<DemoRole, { email: string; password: string; initials: string }> = {
  admin: { email: 'admin@onlyarm.test', password: 'OnlyarmDemo123!', initials: 'AD' },
  customer: { email: 'customer@onlyarm.test', password: 'OnlyarmDemo123!', initials: 'CU' },
};

export function DemoAccountPicker({ on_auth, on_complete }: Props) {
  const { t } = useI18n();
  const [loading_role, set_loading_role] = useState<DemoRole | null>(null);
  const [error, set_error] = useState('');

  async function choose_account(role: DemoRole) {
    const account = demo_accounts[role];
    set_loading_role(role);
    set_error('');
    try {
      const session = await login(account.email, account.password);
      on_auth(session);
      on_complete?.();
    } catch (reason) {
      set_error(reason instanceof Error ? reason.message : 'Unable to sign in');
    } finally {
      set_loading_role(null);
    }
  }

  return (
    <div className="mt-8 space-y-3">
      {(['admin', 'customer'] as const).map((role) => {
        const account = demo_accounts[role];
        const is_loading = loading_role === role;
        return (
          <button
            key={role}
            type="button"
            className="group flex w-full items-center gap-4 rounded-2xl border border-stone-200 p-4 text-left transition hover:border-moss hover:bg-[#f6f8f3] disabled:cursor-wait disabled:opacity-60"
            disabled={loading_role !== null}
            onClick={() => void choose_account(role)}
          >
            <span className={`grid size-12 shrink-0 place-items-center rounded-xl font-extrabold ${role === 'admin' ? 'bg-ink text-lime' : 'bg-[#dce9df] text-moss'}`}>
              {account.initials}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-extrabold">{t(`role_${role}`)}</span>
              <span className="block truncate text-xs text-stone-500">{account.email}</span>
            </span>
            <span className="text-lg font-bold text-moss" aria-hidden="true">{is_loading ? '…' : '→'}</span>
          </button>
        );
      })}
      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}
    </div>
  );
}
