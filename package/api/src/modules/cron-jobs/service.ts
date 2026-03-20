import { pool } from '../../db';
import { NotFoundError } from '../../errors';

export class CronJobsService {
  async checkPgCronAvailable(): Promise<boolean> {
    try {
      const result = await pool.query(
        `SELECT EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') as available`
      );
      return result.rows[0].available;
    } catch {
      return false;
    }
  }

  async getSchedules() {
    const result = await pool.query(`
      SELECT
        j.jobid, j.jobname, j.schedule, j.command,
        j.nodename, j.nodeport, j.database, j.username, j.active,
        count(*) FILTER (WHERE d.status = 'succeeded')::int as success_count,
        count(*) FILTER (WHERE d.status = 'failed')::int as failure_count,
        max(d.start_time)::text as last_run
      FROM cron.job j
      LEFT JOIN cron.job_run_details d ON j.jobid = d.jobid
      GROUP BY j.jobid
      ORDER BY j.jobid
    `);
    return result.rows;
  }

  async getSchedule(jobId: number) {
    const result = await pool.query(`
      SELECT
        j.jobid, j.jobname, j.schedule, j.command,
        j.nodename, j.nodeport, j.database, j.username, j.active,
        count(*) FILTER (WHERE d.status = 'succeeded')::int as success_count,
        count(*) FILTER (WHERE d.status = 'failed')::int as failure_count,
        max(d.start_time)::text as last_run
      FROM cron.job j
      LEFT JOIN cron.job_run_details d ON j.jobid = d.jobid
      WHERE j.jobid = $1
      GROUP BY j.jobid
    `, [jobId]);

    if (result.rows.length === 0) {
      throw new NotFoundError('Cron job not found');
    }

    return result.rows[0];
  }

  async toggleActive(jobId: number, active: boolean) {
    const result = await pool.query(
      `UPDATE cron.job SET active = $1 WHERE jobid = $2 RETURNING *`,
      [active, jobId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Cron job not found');
    }

    return result.rows[0];
  }

  async getHistory(page = 1, pageSize = 20) {
    const offset = (page - 1) * pageSize;

    const [countResult, result] = await Promise.all([
      pool.query(`SELECT count(*)::int as total FROM cron.job_run_details`),
      pool.query(`
        SELECT runid, jobid, job_pid, status, return_message,
               start_time::text, end_time::text
        FROM cron.job_run_details
        ORDER BY start_time DESC NULLS LAST
        LIMIT $1 OFFSET $2
      `, [pageSize, offset]),
    ]);

    return {
      history: result.rows,
      total: countResult.rows[0].total,
    };
  }

  async getJobHistory(jobId: number, page = 1, pageSize = 20) {
    const offset = (page - 1) * pageSize;

    const [countResult, result] = await Promise.all([
      pool.query(`SELECT count(*)::int as total FROM cron.job_run_details WHERE jobid = $1`, [jobId]),
      pool.query(`
        SELECT runid, jobid, job_pid, status, return_message,
               start_time::text, end_time::text
        FROM cron.job_run_details
        WHERE jobid = $1
        ORDER BY start_time DESC NULLS LAST
        LIMIT $2 OFFSET $3
      `, [jobId, pageSize, offset]),
    ]);

    return {
      history: result.rows,
      total: countResult.rows[0].total,
    };
  }
}
