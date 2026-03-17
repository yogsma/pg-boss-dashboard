import { pool } from '../../db';
import { TimeseriesQuery, VALID_NAME_REGEX } from './types';
import { HttpError } from '../../errors';

export class TimeseriesService {
  async discoverTables() {
    const result = await pool.query(`
      SELECT
        c.table_schema, c.table_name, c.column_name as timestamp_column,
        COALESCE(t.n_live_tup, 0)::int as estimated_rows
      FROM information_schema.columns c
      LEFT JOIN pg_stat_user_tables t
        ON t.schemaname = c.table_schema AND t.relname = c.table_name
      WHERE c.data_type IN ('timestamp without time zone', 'timestamp with time zone', 'date')
        AND c.table_schema NOT IN ('pg_catalog', 'information_schema', 'cron')
      ORDER BY COALESCE(t.n_live_tup, 0) DESC
    `);
    return result.rows;
  }

  async getTableColumns(schema: string, table: string) {
    this.validateName(schema, 'schema');
    this.validateName(table, 'table');

    // Verify table exists in information_schema
    const exists = await pool.query(
      `SELECT 1 FROM information_schema.tables WHERE table_schema = $1 AND table_name = $2`,
      [schema, table]
    );

    if (exists.rows.length === 0) {
      throw new HttpError('Table not found', 404);
    }

    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = $1 AND table_name = $2
      ORDER BY ordinal_position
    `, [schema, table]);

    return result.rows;
  }

  async queryTimeseries(query: TimeseriesQuery) {
    // Validate all names against information_schema
    await this.validateTableAndColumns(query);

    const { schema, table, timestampColumn, granularity, startTime, endTime, aggregations } = query;

    let selectClauses = `date_trunc($1, "${timestampColumn}") as bucket, count(*) as count`;
    const params: (string | number)[] = [granularity, startTime, endTime];

    if (aggregations && aggregations.length > 0) {
      const aggClauses = aggregations.map((agg) => {
        this.validateName(agg.column, 'column');
        const alias = agg.alias || `${agg.function}_${agg.column}`;
        return `${agg.function}("${agg.column}") as "${alias}"`;
      });
      selectClauses = `date_trunc($1, "${timestampColumn}") as bucket, count(*) as count, ${aggClauses.join(', ')}`;
    }

    const sql = `
      SELECT ${selectClauses}
      FROM "${schema}"."${table}"
      WHERE "${timestampColumn}" >= $2::timestamptz AND "${timestampColumn}" <= $3::timestamptz
      GROUP BY bucket
      ORDER BY bucket
    `;

    const result = await pool.query(sql, params);
    return result.rows;
  }

  private validateName(name: string, label: string) {
    if (!VALID_NAME_REGEX.test(name)) {
      throw new HttpError(`Invalid ${label} name: ${name}`, 400);
    }
  }

  private async validateTableAndColumns(query: TimeseriesQuery) {
    this.validateName(query.schema, 'schema');
    this.validateName(query.table, 'table');
    this.validateName(query.timestampColumn, 'timestamp column');

    // Verify table exists
    const tableCheck = await pool.query(
      `SELECT 1 FROM information_schema.tables WHERE table_schema = $1 AND table_name = $2`,
      [query.schema, query.table]
    );

    if (tableCheck.rows.length === 0) {
      throw new HttpError(`Table ${query.schema}.${query.table} does not exist`, 400);
    }

    // Verify timestamp column exists and is a timestamp type
    const colCheck = await pool.query(
      `SELECT data_type FROM information_schema.columns
       WHERE table_schema = $1 AND table_name = $2 AND column_name = $3`,
      [query.schema, query.table, query.timestampColumn]
    );

    if (colCheck.rows.length === 0) {
      throw new HttpError(`Column ${query.timestampColumn} does not exist`, 400);
    }

    const dataType = colCheck.rows[0].data_type;
    if (!['timestamp without time zone', 'timestamp with time zone', 'date'].includes(dataType)) {
      throw new HttpError(`Column ${query.timestampColumn} is not a timestamp type`, 400);
    }

    // Validate aggregation columns
    if (query.aggregations) {
      for (const agg of query.aggregations) {
        this.validateName(agg.column, 'aggregation column');
        const aggColCheck = await pool.query(
          `SELECT 1 FROM information_schema.columns
           WHERE table_schema = $1 AND table_name = $2 AND column_name = $3`,
          [query.schema, query.table, agg.column]
        );
        if (aggColCheck.rows.length === 0) {
          throw new HttpError(`Aggregation column ${agg.column} does not exist`, 400);
        }
      }
    }
  }
}
