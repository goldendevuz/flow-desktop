import type { SubscribedChannel } from "../store/useSubscriptionStore";
import type { ChannelDetails, VideoSummary } from "../types/video";

export type SubscriptionSortMode =
  | ""
  | "name"
  | "recent"
  | "subs_desc"
  | "subs_asc"
  | "videos_desc"
  | "videos_asc"
  | "added_new"
  | "added_old";

const SUFFIX: Record<string, number> = { k: 1e3, m: 1e6, b: 1e9 };

/** "333K subscribers" -> 333000, "1.2M" -> 1200000, "1,234 videos" -> 1234. Unreadable text is null. */
export function parseCount(text?: string | null): number | null {
  if (!text) return null;
  const match = text.replace(/\u00a0/g, " ").match(/(\d[\d.,]*)\s*([kmb])?(?![a-z])/i);
  if (!match) return null;
  let digits = match[1]!;
  if (match[2]) digits = digits.replace(/,(?=\d{1,2}$)/, ".").replace(/,/g, "");
  else digits = digits.replace(/[.,]/g, "");
  const value = Number(digits);
  if (!Number.isFinite(value)) return null;
  return Math.round(value * (match[2] ? SUFFIX[match[2].toLowerCase()]! : 1));
}

/** The channels in the viewer's chosen order. The feed is newest first, so a channel's first video is its latest. */
export function sortSubscriptions<T extends Pick<SubscribedChannel, "id" | "name"> & Partial<SubscribedChannel>>(
  channels: T[],
  mode: SubscriptionSortMode,
  feed: VideoSummary[],
  details: Record<string, ChannelDetails | undefined> = {},
): T[] {
  // Channels whose number is unknown always go last, whichever way the list is sorted.
  const byNumber = (value: (channel: T) => number | null, direction: 1 | -1) => (a: T, b: T) => {
    const x = value(a);
    const y = value(b);
    if (x === null && y === null) return a.name.localeCompare(b.name);
    if (x === null) return 1;
    if (y === null) return -1;
    return (x - y) * direction || a.name.localeCompare(b.name);
  };
  const subscribers = (channel: T) =>
    details[channel.id]?.subscriberCount ?? parseCount(details[channel.id]?.subscriberCountText ?? channel.subscriberCountText);
  if (mode === "subs_desc") return [...channels].sort(byNumber(subscribers, -1));
  if (mode === "subs_asc") return [...channels].sort(byNumber(subscribers, 1));
  if (mode === "videos_desc" || mode === "videos_asc") {
    const videos = (channel: T) => parseCount(details[channel.id]?.videoCountText);
    const direction = mode === "videos_desc" ? -1 : 1;
    const byVideos = byNumber(videos, direction);
    const bySubscribers = byNumber(subscribers, -1);
    // Equal video counts: the channel with more subscribers comes first.
    return [...channels].sort((a, b) => (videos(a) === videos(b) ? bySubscribers(a, b) : byVideos(a, b)));
  }
  if (mode === "added_new") return [...channels].sort(byNumber((channel) => channel.subscribedAt ?? null, -1));
  if (mode === "added_old") return [...channels].sort(byNumber((channel) => channel.subscribedAt ?? null, 1));
  if (mode === "name") return [...channels].sort((a, b) => a.name.localeCompare(b.name));
  if (mode === "recent") {
    const latest = new Map<string, number>();
    feed.forEach((video, index) => {
      if (video.channelId && !latest.has(video.channelId)) latest.set(video.channelId, index);
    });
    const rank = (channel: T) => latest.get(channel.id) ?? Infinity;
    return [...channels].sort((a, b) => rank(a) - rank(b));
  }
  return channels;
}

export type SubscriptionKind = "video" | "music";

export function channelsOfKind<T extends Pick<SubscribedChannel, "isMusic">>(channels: T[], kind: SubscriptionKind): T[] {
  return channels.filter((channel) => Boolean(channel.isMusic) === (kind === "music"));
}
