"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Import web vitals
import { initWebVitals } from "@/lib/web-vitals";

export default function SEOOptimizations() {
  const pathname = usePathname();

  useEffect(() => {
    // Preload critical resources
    const preloadLink = document.createElement("link");
    preloadLink.rel = "preload";
    preloadLink.as = "font";
    preloadLink.href = "/fonts/geist-sans.woff2";
    preloadLink.crossOrigin = "anonymous";
    document.head.appendChild(preloadLink); // Initialize web vitals monitoring
    initWebVitals();

    // Cleanup
    return () => {
      if (preloadLink.parentNode) {
        preloadLink.parentNode.removeChild(preloadLink);
      }
    };
  }, []); // Track page views
  useEffect(() => {
    const gaId = process.env.NEXT_PUBLIC_GA_ID;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const windowWithGtag = window as Window & {
      gtag?: (...args: any[]) => void;
    };
    if (typeof window !== "undefined" && windowWithGtag.gtag && gaId) {
      windowWithGtag.gtag("config", gaId, {
        page_path: pathname,
      });
    }
  }, [pathname]);

  return null;
}
