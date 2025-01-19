import { pool } from '../db';
import { Job, Queue } from '../types/queue';

export class QueueService {
  async getJob(jobId: string): Promise<Job> {
    const result = await pool.query(`SELECT * FROM pgboss.job WHERE id = $1`, [jobId]);

    if (result.rows.length === 0) {
      throw new Error('Job not found');
    }

    return result.rows[0];
  }

  async getAllJobs(
    queueName: string,
    page = 1,
    pageSize = 10
  ): Promise<{ jobs: Job[]; total: number }> {
    const offset = (page - 1) * pageSize;

    const countResult = await pool.query(`SELECT COUNT(*) FROM pgboss.job WHERE name = $1`, [
      queueName,
    ]);

    const result = await pool.query(
      `SELECT * FROM pgboss.job 
       WHERE name = $1 
       ORDER BY createdon DESC 
       LIMIT $2 OFFSET $3`,
      [queueName, pageSize, offset]
    );

    return {
      jobs: result.rows,
      total: parseInt(countResult.rows[0].count),
    };
  }

  async getAllQueues(): Promise<Queue[]> {
    const result = await pool.query(`
      SELECT 
        name,
        COUNT(CASE WHEN state = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN state = 'failed' THEN 1 END) as failed,
        COUNT(CASE WHEN state = 'active' THEN 1 END) as active
      FROM pgboss.job
      GROUP BY name
    `);

    return result.rows.map((row) => ({
      name: row.name,
      stats: {
        completed: parseInt(row.completed) || 0,
        failed: parseInt(row.failed) || 0,
        active: parseInt(row.active) || 0,
      },
    }));
  }

  async getQueueDetails(queueName: string): Promise<Queue> {
    const result = await pool.query(
      `
      SELECT 
        name,
        COUNT(CASE WHEN state = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN state = 'failed' THEN 1 END) as failed,
        COUNT(CASE WHEN state = 'active' THEN 1 END) as active
      FROM pgboss.job
      WHERE name = $1
      GROUP BY name
    `,
      [queueName]
    );

    if (result.rows.length === 0) {
      throw new Error('Queue not found');
    }

    const row = result.rows[0];
    return {
      name: row.name,
      stats: {
        completed: parseInt(row.completed) || 0,
        failed: parseInt(row.failed) || 0,
        active: parseInt(row.active) || 0,
      },
    };
  }
}
