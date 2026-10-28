import React from 'react';
import { Header } from './Header';
import { Navigation } from './Navigation';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24">
      <Header />
      <main className="max-w-[760px] mx-auto px-4 py-6">
        {children}
      </main>
      <Navigation />
    </div>
  );
};
