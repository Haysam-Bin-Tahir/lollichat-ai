'use client';

import { createContext, useContext } from 'react';
import { usePathname } from 'next/navigation';

const LayoutContext = createContext({ showHeaderAndFooter: false });

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showHeaderAndFooter = ['/topics', '/privacy-policy', '/terms-of-service'].includes(pathname);

  return (
    <LayoutContext.Provider value={{ showHeaderAndFooter }}>
      {children}
    </LayoutContext.Provider>
  );
}

export const useLayout = () => useContext(LayoutContext); 