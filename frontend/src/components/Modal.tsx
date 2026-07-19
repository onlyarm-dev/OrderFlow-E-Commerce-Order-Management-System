import type { ReactNode } from 'react';

type Props = { title: string; on_close: () => void; children: ReactNode };

export function Modal({ title, on_close, children }: Props) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={title}>
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-canvas shadow-2xl">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-canvas px-6 py-5">
          <h2 className="text-xl font-extrabold">{title}</h2>
          <button className="grid size-9 place-items-center rounded-full bg-white text-lg" onClick={on_close} aria-label="Close">×</button>
        </header>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
