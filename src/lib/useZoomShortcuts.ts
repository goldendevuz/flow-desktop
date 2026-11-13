import { useEffect } from "react";
import { getCurrentWebview } from "@tauri-apps/api/webview";
import { isTauriEnv } from "./api/env";
import { profileStorage } from "./storage/profileStorage";

const STORAGE_KEY = "flow.zoom";
const STEP = 0.1;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.5;

/** One zoom step from `current`, kept inside the supported range and off float dust. */
export function nextZoom(current: number, direction: "in" | "out" | "reset"): number {
  if (direction === "reset") return 1;
  const next = current + (direction === "in" ? STEP : -STEP);
  return Math.round(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next)) * 100) / 100;
}

/** Which zoom a key press asks for: Ctrl +, Ctrl -, Ctrl 0, on any layout, main row or numpad. */
export function zoomDirectionOf(event: Pick<KeyboardEvent, "key" | "ctrlKey" | "metaKey" | "altKey">): "in" | "out" | "reset" | null {
  if (!(event.ctrlKey || event.metaKey) || event.altKey) return null;
  if (event.key === "+" || event.key === "=") return "in";
  if (event.key === "-" || event.key === "_") return "out";
  if (event.key === "0") return "reset";
  return null;
}

function savedZoom(): number {
  try {
    const value = Number(profileStorage.getItem(STORAGE_KEY, "device"));
    return Number.isFinite(value) && value >= MIN_ZOOM && value <= MAX_ZOOM ? value : 1;
  } catch {
    return 1;
  }
}

function saveZoom(value: number): void {
  try {
    profileStorage.setItem(STORAGE_KEY, String(value), "device");
  } catch {
    // A zoom that is not remembered still applies for this session.
  }
}

/** Ctrl + / Ctrl - / Ctrl 0 zoom the whole app, and the level is kept between launches. */
export function useZoomShortcuts(): void {
  useEffect(() => {
    let zoom = savedZoom();
    let active = true;

    const apply = async (value: number) => {
      if (!(await isTauriEnv())) return;
      try {
        await getCurrentWebview().setZoom(value);
      } catch (error) {
        console.warn("Could not set the zoom", error);
      }
    };

    if (zoom !== 1) void apply(zoom);

    const onKey = (event: KeyboardEvent) => {
      const direction = zoomDirectionOf(event);
      if (!direction || !active) return;
      event.preventDefault();
      zoom = nextZoom(zoom, direction);
      saveZoom(zoom);
      void apply(zoom);
    };

    window.addEventListener("keydown", onKey);
    return () => {
      active = false;
      window.removeEventListener("keydown", onKey);
    };
  }, []);
}
