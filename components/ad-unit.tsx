"use client";

import { useEffect } from "react";
import Script from "next/script";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface AdUnitProps {
  className?: string;
  slot?: string;
  format?: "auto" | "fluid" | "rectangle";
  responsive?: "true" | "false";
  style?: React.CSSProperties;
}

export default function AdUnit({
  className = "",
  slot = "2430405252",
  format = "auto",
  responsive = "true",
  style = { display: "block" },
}: AdUnitProps) {
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.adsbygoogle) {
        window.adsbygoogle.push({});
      }
    } catch (err) {
      console.error("AdSense error:", err);
    }
  }, []);

  return (
    <div className={`ad-container w-full overflow-hidden ${className}`}>
      <Script
        strategy="afterInteractive"
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3448314338744263"
        crossOrigin="anonymous"
      />
      <div style={{ width: "100%", minHeight: "250px" }}>
        <ins
          className="adsbygoogle"
          style={style}
          data-ad-client="ca-pub-3448314338744263"
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive={responsive}
        />
      </div>
    </div>
  );
}
