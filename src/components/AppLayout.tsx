import { ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';
import { BottomNav } from './BottomNav';

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <main className="flex-1 min-w-0 pb-20 md:pb-0">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-6 md:py-12">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
