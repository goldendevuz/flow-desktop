-- A channel's subscriber count as last read, for the "Hide channels with fewer subscribers than"
-- setting. A count is a fact about the channel, so this is a cache: a count older than a month
-- is read again.
CREATE TABLE IF NOT EXISTS home_channel_subscribers (
    channel_id TEXT PRIMARY KEY,
    subscribers INTEGER NOT NULL,
    fetched_at INTEGER NOT NULL
);
