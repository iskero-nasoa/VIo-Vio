"use client";

import React, { useEffect } from 'react';
import '../styles/globals.css';
import Providers from '../components/Providers';
import { registerServiceWorker } from '../utils/serviceWorkerRegister';

export default function RootLayout({ children }) {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <html lang="en">
      <head>
        <title>VioApp</title>
        <meta name="description" content="Real-time messenger application with supergroups and calls." />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#007AFF" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="VioApp" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="select-none touch-pan-y">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
