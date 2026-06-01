import { Link, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link
            to="/"
            className="flex items-center gap-2 text-lg font-bold tracking-tight hover:opacity-80 transition-opacity"
          >
            <span className="text-primary">MathPath</span>
          </Link>
          {!isHome && (
            <nav className="flex items-center gap-4 ml-8 text-sm font-medium text-muted-foreground">
              <Link
                to="/"
                className="hover:text-foreground transition-colors"
              >
                Все ветви
              </Link>
            </nav>
          )}
        </div>
      </header>
      <main className="flex-1 container py-6">{children}</main>
    </div>
  );
}
