import { describe, expect, it } from "vitest";
import { nextZoom, zoomDirectionOf } from "./useZoomShortcuts";

const press = (key: string, extra: Partial<KeyboardEvent> = {}) => ({ key, ctrlKey: true, metaKey: false, altKey: false, ...extra });

describe("zoomDirectionOf", () => {
  it("reads Ctrl +, Ctrl =, Ctrl - and Ctrl 0", () => {
    expect(zoomDirectionOf(press("+"))).toBe("in");
    expect(zoomDirectionOf(press("="))).toBe("in");
    expect(zoomDirectionOf(press("-"))).toBe("out");
    expect(zoomDirectionOf(press("_"))).toBe("out");
    expect(zoomDirectionOf(press("0"))).toBe("reset");
  });

  it("ignores keys without Ctrl, with Alt, or that are not zoom keys", () => {
    expect(zoomDirectionOf(press("-", { ctrlKey: false }))).toBeNull();
    expect(zoomDirectionOf(press("-", { altKey: true }))).toBeNull();
    expect(zoomDirectionOf(press("a"))).toBeNull();
  });
});

describe("nextZoom", () => {
  it("steps by a tenth and resets to 1", () => {
    expect(nextZoom(1, "out")).toBe(0.9);
    expect(nextZoom(1, "in")).toBe(1.1);
    expect(nextZoom(0.7, "reset")).toBe(1);
  });

  it("stays inside the range and avoids float dust", () => {
    expect(nextZoom(0.5, "out")).toBe(0.5);
    expect(nextZoom(2.5, "in")).toBe(2.5);
    expect(nextZoom(0.8, "in")).toBe(0.9);
  });
});
