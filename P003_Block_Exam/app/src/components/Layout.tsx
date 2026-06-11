import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useLang } from '@/context/LangContext';
import type { I18n, Lang } from '@/types';

const NAV: { to: string; exact?: boolean; icon: string; label: I18n }[] = [
  {
    to: '/',
    exact: true,
    icon: '📊',
    label: { az: 'İcmal', ru: 'Главная', en: 'Dashboard' },
  },
  {
    to: '/topics',
    icon: '📚',
    label: { az: 'Mövzular', ru: 'Темы', en: 'Topics' },
  },
  {
    to: '/tests',
    icon: '📝',
    label: { az: 'Testlər', ru: 'Тесты', en: 'Tests' },
  },
  {
    to: '/proofs',
    icon: '🔬',
    label: { az: 'İsbatlar', ru: 'Доказательства', en: 'Proofs' },
  },
  {
    to: '/situational',
    icon: '🧩',
    label: { az: 'Situasiya', ru: 'Ситуационные', en: 'Situational' },
  },
];

const LANGS: { code: Lang; label: string }[] = [
  { code: 'az', label: 'AZ' },
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { pathname } = useLocation();
  const { lang, setLang, t } = useLang();

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + '/');

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black text-base shrink-0">
          D
        </div>
        <div className="min-w-0">
          <p className="font-bold text-sm leading-tight text-sidebar-foreground">DİM Math</p>
          <p className="text-xs text-muted-foreground truncate">Hazırlıq / Подготовка</p>
        </div>
      </div>

      <nav className="flex flex-col gap-0.5 px-2 py-3 flex-1">
        {NAV.map((item) => {
          const active = isActive(item.to, item.exact);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`}
            >
              <span className="text-base leading-none w-5 text-center">{item.icon}</span>
              <span>{t(item.label)}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-sidebar-border">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Dil / Язык
        </p>
        <div className="flex gap-1">
          {LANGS.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => setLang(code)}
              className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-colors ${
                lang === code
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useLang();
  const { pathname } = useLocation();

  const currentNav = NAV.find((n) =>
    n.exact ? pathname === n.to : pathname === n.to || pathname.startsWith(n.to + '/'),
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-sidebar-border bg-sidebar h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-60 bg-sidebar border-r border-sidebar-border md:hidden transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent onClose={() => setMobileOpen(false)} />
      </aside>

      <div className="flex flex-col flex-1 min-w-0">
        <header className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-background/95 backdrop-blur sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
            aria-label="Меню"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-semibold text-sm">
            {currentNav ? (
              <>
                <span className="mr-1.5">{currentNav.icon}</span>
                {t(currentNav.label)}
              </>
            ) : (
              'DİM Math'
            )}
          </span>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
