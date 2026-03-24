import { pool } from '../../db';

export class DbHealthService {
  async getOverview() {
    const [connections, cacheHit, dbSize] = await Promise.all([
      this.getConnectionSummary(),
      this.getCacheHitRatio(),
      this.getDatabaseSize(),
    ]);

    return { connections, cacheHitRatio: cacheHit, dbSize };
  }

  async getConnectionSummary() {
    const result = await pool.query(`
      SELECT
        count(*)::int as total,
        count(*) FILTER (WHERE state = 'active')::int as active,
        count(*) FILTER (WHERE state = 'idle')::int as idle,
        count(*) FILTER (WHERE state = 'idle in transaction')::int as idle_in_transaction,
        (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') as max_connections
      FROM pg_stat_activity
      WHERE datname = current_database()
    `);
    return result.rows[0];
  }

  async getCacheHitRatio() {
    const result = await pool.query(`
      SELECT
        COALESCE(
          sum(heap_blks_hit)::float / NULLIF(sum(heap_blks_hit) + sum(heap_blks_read), 0),
          0
        ) as ratio
      FROM pg_statio_user_tables
    `);
    return parseFloat(result.rows[0].ratio) || 0;
  }

  async getDatabaseSize() {
    const result = await pool.query(`
      SELECT pg_size_pretty(pg_database_size(current_database())) as size,
             pg_database_size(current_database()) as size_bytes
    `);
    return result.rows[0];
  }

  async getConnections() {
    const result = await pool.query(`
      SELECT
        pid, usename, application_name, client_addr::text,
        state, query,
        query_start::text, backend_start::text,
        wait_event_type, wait_event
      FROM pg_stat_activity
      WHERE datname = current_database()
      ORDER BY backend_start DESC
    `);
    return result.rows;
  }

  async getSlowQueries(minDurationSeconds = 5) {
    const result = await pool.query(
      `
      SELECT
        pid, usename, query,
        EXTRACT(EPOCH FROM (now() - query_start))::float as duration_seconds,
        state, wait_event_type
      FROM pg_stat_activity
      WHERE state = 'active'
        AND query NOT ILIKE '%pg_stat_activity%'
        AND query_start IS NOT NULL
        AND EXTRACT(EPOCH FROM (now() - query_start)) > $1
      ORDER BY query_start ASC
    `,
      [minDurationSeconds]
    );
    return result.rows;
  }

  async getTables() {
    const result = await pool.query(`
      SELECT
        schemaname, relname,
        pg_size_pretty(pg_total_relation_size(relid)) as total_size,
        pg_total_relation_size(relid) as total_size_bytes,
        pg_size_pretty(pg_indexes_size(relid)) as index_size,
        n_live_tup::int as estimated_rows
      FROM pg_stat_user_tables
      ORDER BY pg_total_relation_size(relid) DESC
    `);
    return result.rows;
  }

  async getIndexes() {
    const result = await pool.query(`
      SELECT
        schemaname, relname as tablename, indexrelname as indexname,
        pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
        pg_relation_size(indexrelid) as index_size_bytes,
        idx_scan::int, idx_tup_read::int, idx_tup_fetch::int
      FROM pg_stat_user_indexes
      ORDER BY pg_relation_size(indexrelid) DESC
    `);
    return result.rows;
  }

  async getUnusedIndexes() {
    const result = await pool.query(`
      SELECT
        schemaname, relname as tablename, indexrelname as indexname,
        pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
        pg_relation_size(indexrelid) as index_size_bytes,
        idx_scan::int, idx_tup_read::int, idx_tup_fetch::int
      FROM pg_stat_user_indexes
      WHERE idx_scan = 0
      ORDER BY pg_relation_size(indexrelid) DESC
    `);
    return result.rows;
  }

  async getConnectionTopology() {
    const result = await pool.query(`
      SELECT
        application_name,
        count(*)::int as total,
        count(*) FILTER (WHERE state = 'active')::int as active,
        count(*) FILTER (WHERE state = 'idle')::int as idle,
        count(*) FILTER (WHERE state = 'idle in transaction')::int as idle_in_transaction
      FROM pg_stat_activity
      WHERE datname = current_database()
        AND pid != pg_backend_pid()
      GROUP BY application_name
      ORDER BY total DESC
    `);
    return result.rows;
  }

  async getIdleInTransaction() {
    const result = await pool.query(`
      SELECT
        pid, usename, application_name, client_addr::text,
        EXTRACT(EPOCH FROM (now() - xact_start))::float as duration_seconds,
        query, state
      FROM pg_stat_activity
      WHERE state = 'idle in transaction'
        AND datname = current_database()
      ORDER BY xact_start ASC
    `);
    return result.rows;
  }

  async getBlockedConnections() {
    const result = await pool.query(`
      SELECT
        blocked.pid as blocked_pid,
        blocked.usename as blocked_user,
        blocked.application_name as blocked_app,
        blocked.query as blocked_query,
        EXTRACT(EPOCH FROM (now() - blocked.query_start))::float as waiting_seconds,
        blocking.pid as blocking_pid,
        blocking.usename as blocking_user,
        blocking.application_name as blocking_app,
        blocking.query as blocking_query
      FROM pg_locks blocked_locks
      JOIN pg_stat_activity blocked ON blocked.pid = blocked_locks.pid
      JOIN pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
        AND blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database
        AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
        AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page
        AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple
        AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid
        AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid
        AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid
        AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid
        AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid
        AND blocking_locks.pid != blocked_locks.pid
      JOIN pg_stat_activity blocking ON blocking.pid = blocking_locks.pid
      WHERE NOT blocked_locks.granted
        AND blocked.datname = current_database()
    `);
    return result.rows;
  }

  async getConnectionHealth(minDurationSeconds = 5) {
    const [idleInTransaction, longRunningQueries, blockedConnections] = await Promise.all([
      this.getIdleInTransaction(),
      this.getSlowQueries(minDurationSeconds),
      this.getBlockedConnections(),
    ]);

    return { idleInTransaction, longRunningQueries, blockedConnections };
  }
}
