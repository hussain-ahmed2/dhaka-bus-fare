"use client";

import { useEffect } from "react";
import Script from "next/script";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface MultiplexAdProps {
  className?: string;
}

export default function MultiplexAd({ className = "" }: MultiplexAdProps) {
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.adsbygoogle) {
        window.adsbygoogle.push({});
      }
    } catch (err) {
      console.error("AdSense error (Multiplex):", err);
    }
  }, []);

  return (
    <div
      className={`multiplex-ad-container w-full overflow-hidden ${className}`}
    >
      <Script
        strategy="afterInteractive"
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3448314338744263"
        crossOrigin="anonymous"
      />
      <div style={{ width: "100%", minHeight: "500px" }}>
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-format="autorelaxed"
          data-ad-client="ca-pub-3448314338744263"
          data-ad-slot="9390235708"
        />
      </div>
    </div>
  );
}
