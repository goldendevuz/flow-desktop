import { describe, expect, it } from "vitest";
import { homeOriginLabel, homeReasonLine } from "./homeOrigin";

describe("homeReasonLine", () => {
  it("speaks only for channels the viewer keeps watching", () => {
    expect(homeReasonLine({ kind: "channelMemory" })).toBe("From a channel you watch");
    expect(homeReasonLine({ kind: "subscription" })).toBeUndefined();
    expect(homeReasonLine(undefined)).toBeUndefined();
  });
});

describe("homeOriginLabel", () => {
  it("names the followed channel when it is known", () => {
    expect(homeOriginLabel({ kind: "subscription" }, "Euronews")).toBe("From Euronews, a channel you follow");
  });

  it("falls back to the plain line without a name", () => {
    expect(homeOriginLabel({ kind: "subscription" })).toBe("From a channel you follow");
    expect(homeOriginLabel({ kind: "subscription" }, "  ")).toBe("From a channel you follow");
  });
});
