"use client";

import { useEffect, useRef, useState } from "react";

type GeoState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "granted"; lat: number; lng: number; accuracy: number }
  | { status: "denied" }
  | { status: "unsupported" };

// Real browser geolocation, not the fixed field coordinates used elsewhere.
// Requires HTTPS (or localhost, which counts) and the user granting the
// browser's own location permission prompt — this hook never sees a
// location unless the browser itself hands one over, and only starts
// watching once `locate()` is called from a real user action (a button
// click), not automatically on mount.
export function useGeolocation() {
  const [state, setState] = useState<GeoState>({ status: "idle" });
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  function locate() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState({ status: "unsupported" });
      return;
    }

    setState({ status: "loading" });

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setState({
          status: "granted",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      () => setState({ status: "denied" }),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
  }

  return { state, locate };
}
