use sqlx::FromRow;
use chrono::{DateTime, Utc, Duration, DurationRound};
use serde::Serialize;
use std::thread;
use std::sync::Arc;
use tokio::sync::Mutex;

use super::sql;
use crate::sql::Sql;
use crate::config::Config;

#[derive(Debug, Clone, Serialize, FromRow)]
pub struct PackStatsPair {
    #[sqlx(rename="pstime")]
    pub time: DateTime<Utc>,
    #[sqlx(rename="psamount")]
    pub amount: i32
}

#[derive(Debug)]
pub struct PackStats {
    pub running: bool,
    pub data: Vec<PackStatsPair>,

    pub data_span: Duration,
    pub data_amount: u32,
    pub sql: Sql
}

impl PackStats {
    pub async fn new(sql: Sql, config: &Config) -> Result<PackStats, sqlx::Error> {
        Ok(Self {
            running: true,
            data: Vec::new(),

            data_span: Duration::seconds(config.pack_data_span as _),
            data_amount: config.pack_data_amount,
            sql
        })
    }

    pub async fn init(&mut self) -> Result<(), sqlx::Error> {
        let now = Utc::now().duration_trunc(Duration::seconds(1)).unwrap();
        let end_date = now - Duration::seconds(now.timestamp() % self.data_span.num_seconds()) + self.data_span;
        let start_date = end_date - self.data_span * self.data_amount as _;

        let mut con = self.sql.get_con().await?;
        let data = sql::load_pack_stats(&mut con, &start_date, &end_date).await?;

        for i in 0..self.data_amount {
            let time = start_date + self.data_span * i as _;

            let mut amount = 0;
            for d in data.iter() {
                if d.time == time {
                    amount = d.amount;
                    break;
                }
            };

            self.data.push(PackStatsPair { time, amount })
        }

        Ok(())
    }

    pub async fn add_pack_stats(pack_stats: Arc<Mutex<Self>>, amount: i32) -> Result<(), sqlx::Error> {
        let mut pack_stats = pack_stats.lock().await;
        pack_stats.data.last_mut().unwrap().amount += amount;

        Ok(())
    }

    pub async fn start_thread(pack_stats: Arc<Mutex<Self>>) -> Result<(), sqlx::Error> {
        {
            let pack_stats = pack_stats.lock().await;
            let now = Utc::now().duration_trunc(Duration::seconds(1)).unwrap();
            let end_date = now - Duration::seconds(now.timestamp() % pack_stats.data_span.num_seconds()) + pack_stats.data_span;
            drop(pack_stats);
            thread::sleep((end_date - now).to_std().unwrap());
        }

        while pack_stats.lock().await.running {
            let mut pack_stats = pack_stats.lock().await;
            pack_stats.data.remove(0);

            let mut con = pack_stats.sql.get_con().await?;
            let last_pair = pack_stats.data.last().unwrap();

            sql::add_pack_stats(&mut con, &last_pair.time, last_pair.amount).await.unwrap();

            let time = last_pair.time + pack_stats.data_span;
            pack_stats.data.push(PackStatsPair {
                time,
                amount: 0
            });
            let sleep_duration = pack_stats.data_span.to_std().unwrap();

            drop(pack_stats);
            //maybe wait for next point instead of fixed duration if it gets out of sync
            thread::sleep(sleep_duration);
        }

        Ok(())
    }
}
