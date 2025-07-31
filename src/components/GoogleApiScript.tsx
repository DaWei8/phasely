// components/GoogleApiScript.tsx
"use client";
import Script from 'next/script';

export const GoogleApiScript = () => {
  return (
    <Script
      src="https://apis.google.com/js/api.js"
      strategy="lazyOnload"
      onLoad={() => {
        console.log('Google API script loaded');
      }}
    />
  );
};