//! Subscriber counts of channels Home has looked up, by channel id, so the "fewest subscribers"
//! setting does not ask YouTube about the same channel twice.

use std::collections::HashMap;

use sqlx::{Row, SqlitePool};

use crate::errors::AppResult;

/// A count read longer ago than this is read again.
const FRESH_MS: i64 = 30 * 86_400_000;
const MAX_ROWS: i64 = 20_000;

/// The counts read within the last month.
pub async fn fresh(pool: &SqlitePool, now_ms: i64) -> AppResult<HashMap<String, u64>> {
    let rows = sqlx::query(
        "SELECT channel_id, subscribers FROM home_channel_subscribers WHERE fetched_at >= ?",
    )
    .bind(now_ms.saturating_sub(FRESH_MS))
    .fetch_all(pool)
    .await?;
    Ok(rows
        .into_iter()
        .filter_map(|row| {
            let id: String = row.get(0);
            let count: i64 = row.get(1);
            u64::try_from(count).ok().map(|count| (id, count))
        })
        .collect())
}

/// Records counts read at `now_ms`, then lets go of the oldest past the cap.
pub async fn remember(
    pool: &SqlitePool,
    counts: &HashMap<String, u64>,
    now_ms: i64,
) -> AppResult<()> {
    if counts.is_empty() {
        return Ok(());
    }
    let mut tx = pool.begin().await?;
    for (id, count) in counts {
        sqlx::query(
            "INSERT OR REPLACE INTO home_channel_subscribers (channel_id, subscribers, fetched_at) VALUES (?, ?, ?)",
        )
        .bind(id)
        .bind(i64::try_from(*count).unwrap_or(i64::MAX))
        .bind(now_ms)
        .execute(&mut *tx)
        .await?;
    }
    sqlx::query(
        "DELETE FROM home_channel_subscribers WHERE channel_id NOT IN (
             SELECT channel_id FROM home_channel_subscribers ORDER BY fetched_at DESC LIMIT ?)",
    )
    .bind(MAX_ROWS)
    .execute(&mut *tx)
    .await?;
    tx.commit().await?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    async fn pool() -> SqlitePool {
        let pool = sqlx::sqlite::SqlitePoolOptions::new()
            .max_connections(1)
            .connect("sqlite::memory:")
            .await
            .unwrap();
        sqlx::migrate!("./migrations").run(&pool).await.unwrap();
        pool
    }

    fn counts(list: &[(&str, u64)]) -> HashMap<String, u64> {
        list.iter().map(|(id, n)| ((*id).to_string(), *n)).collect()
    }

    #[tokio::test]
    async fn a_count_is_kept_for_a_month_and_then_read_again() {
        let pool = pool().await;
        remember(&pool, &counts(&[("old", 10)]), 0).await.unwrap();
        remember(&pool, &counts(&[("new", 99_000)]), FRESH_MS + 1)
            .await
            .unwrap();
        let known = fresh(&pool, FRESH_MS + 2).await.unwrap();
        assert_eq!(known, counts(&[("new", 99_000)]));
    }

    #[tokio::test]
    async fn a_newer_reading_replaces_the_older_one() {
        let pool = pool().await;
        remember(&pool, &counts(&[("a", 1_000)]), 5).await.unwrap();
        remember(&pool, &counts(&[("a", 2_000)]), 6).await.unwrap();
        assert_eq!(fresh(&pool, 7).await.unwrap(), counts(&[("a", 2_000)]));
    }
}
