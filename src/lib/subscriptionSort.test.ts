import { describe, expect, it } from "vitest";
import { channelsOfKind, parseCount, sortSubscriptions } from "./subscriptionSort";
import type { VideoSummary } from "../types/video";

const channels = [
  { id: "b", name: "Beta" },
  { id: "a", name: "alpha" },
  { id: "c", name: "Gamma", isMusic: true },
];
const video = (channelId: string) => ({ id: channelId, title: "", channelName: "", channelId }) as VideoSummary;

describe("sortSubscriptions", () => {
  it("keeps the stored order by default", () => {
    expect(sortSubscriptions(channels, "", [])).toBe(channels);
  });

  it("sorts by name, whatever the case", () => {
    expect(sortSubscriptions(channels, "name", []).map((c) => c.id)).toEqual(["a", "b", "c"]);
  });

  it("puts the channel with the latest upload first and the silent last", () => {
    const sorted = sortSubscriptions(channels, "recent", [video("c"), video("b"), video("c")]);
    expect(sorted.map((c) => c.id)).toEqual(["c", "b", "a"]);
  });
});

describe("channelsOfKind", () => {
  it("splits video channels from music ones", () => {
    expect(channelsOfKind(channels, "music").map((c) => c.id)).toEqual(["c"]);
    expect(channelsOfKind(channels, "video").map((c) => c.id)).toEqual(["b", "a"]);
  });
});

describe("parseCount", () => {
  it("reads the short and the long forms", () => {
    expect(parseCount("333K subscribers")).toBe(333000);
    expect(parseCount("1.2M subscribers")).toBe(1200000);
    expect(parseCount("3,18K")).toBe(3180);
    expect(parseCount("1,234 videos")).toBe(1234);
    expect(parseCount("70 subscribers")).toBe(70);
  });

  it("gives up on text without a number", () => {
    expect(parseCount("")).toBeNull();
    expect(parseCount(null)).toBeNull();
    expect(parseCount("No subscribers")).toBeNull();
  });
});

describe("sortSubscriptions by numbers", () => {
  const list = [
    { id: "a", name: "A", subscriberCountText: "10K subscribers", subscribedAt: 5 },
    { id: "b", name: "B", subscriberCountText: "2M subscribers", subscribedAt: 9 },
    { id: "c", name: "C", subscribedAt: 1 },
  ];

  it("orders by subscribers both ways and keeps unknown ones last", () => {
    expect(sortSubscriptions(list, "subs_desc", []).map((c) => c.id)).toEqual(["b", "a", "c"]);
    expect(sortSubscriptions(list, "subs_asc", []).map((c) => c.id)).toEqual(["a", "b", "c"]);
  });

  it("prefers the exact count from the channel details", () => {
    const details = { a: { subscriberCount: 5_000_000 } } as never;
    expect(sortSubscriptions(list, "subs_desc", [], details).map((c) => c.id)).toEqual(["a", "b", "c"]);
  });

  it("orders by video count", () => {
    const details = { a: { videoCountText: "20 videos" }, b: { videoCountText: "1,500 videos" } } as never;
    expect(sortSubscriptions(list, "videos_desc", [], details).map((c) => c.id)).toEqual(["b", "a", "c"]);
    expect(sortSubscriptions(list, "videos_asc", [], details).map((c) => c.id)).toEqual(["a", "b", "c"]);
  });

  it("breaks a video count tie by subscribers", () => {
    const tied = [
      { id: "x", name: "X", subscriberCountText: "5K" },
      { id: "y", name: "Y", subscriberCountText: "9M" },
      { id: "z", name: "Z", subscriberCountText: "70K" },
    ];
    const details = { x: { videoCountText: "1 video" }, y: { videoCountText: "1 video" }, z: { videoCountText: "1 video" } } as never;
    expect(sortSubscriptions(tied, "videos_asc", [], details).map((c) => c.id)).toEqual(["y", "z", "x"]);
    expect(sortSubscriptions(tied, "videos_desc", [], details).map((c) => c.id)).toEqual(["y", "z", "x"]);
  });

  it("orders by when the channel was subscribed", () => {
    expect(sortSubscriptions(list, "added_new", []).map((c) => c.id)).toEqual(["b", "a", "c"]);
    expect(sortSubscriptions(list, "added_old", []).map((c) => c.id)).toEqual(["c", "a", "b"]);
  });
});
