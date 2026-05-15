"use client";

import React, { useEffect, useState } from 'react';

// Wrap children with any needed providers (e.g., ThemeProvider, QueryClientProvider)
// Currently, Zustand doesn't strictly need a provider wrapper, 
// but this is standard for future expansions.
export default function Providers({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by only rendering children after mount if needed,
  // or simply return children.
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <>
      {children}
    </>
  );
}
