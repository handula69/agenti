"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // PWA registrace je jen vylepšení, selhání nesmí appce bránit v běhu
      });
    }
  }, []);
  return null;
}
