import { Env, jsonResponse, getAuthUser } from './_utils';

export async function onRequestGet(context: { request: Request; env: Env }) {
  try {
    const { request, env } = context;
    if (!env.DB) {
      return jsonResponse({ error: 'Database binding (DB) is not configured' }, 503);
    }

    const secret = env.JWT_SECRET || 'nestfit-default-jwt-secret-key';
    const auth = await getAuthUser(request, secret);
    if (!auth) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const record = await env.DB.prepare(
      'SELECT template_id, schedule_data, updated_at FROM user_schedules WHERE user_id = ?'
    ).bind(auth.userId).first<{
      template_id: string;
      schedule_data: string;
      updated_at: string;
    }>();

    if (!record) {
      return jsonResponse({ schedule: null }, 200);
    }

    return jsonResponse({
      schedule: {
        templateId: record.template_id,
        scheduleData: JSON.parse(record.schedule_data),
        updatedAt: record.updated_at
      }
    }, 200);
  } catch (err: any) {
    return jsonResponse({ error: err.message || 'Internal server error' }, 500);
  }
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  try {
    const { request, env } = context;
    if (!env.DB) {
      return jsonResponse({ error: 'Database binding (DB) is not configured' }, 503);
    }

    const secret = env.JWT_SECRET || 'nestfit-default-jwt-secret-key';
    const auth = await getAuthUser(request, secret);
    if (!auth) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const body = await request.json() as {
      templateId?: string;
      scheduleData?: any;
    };

    const { templateId, scheduleData } = body || {};
    if (!templateId || !scheduleData) {
      return jsonResponse({ error: 'templateId and scheduleData are required' }, 400);
    }

    const now = new Date().toISOString();
    const scheduleJson = JSON.stringify(scheduleData);

    await env.DB.prepare(`
      INSERT INTO user_schedules (user_id, template_id, schedule_data, updated_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        template_id = excluded.template_id,
        schedule_data = excluded.schedule_data,
        updated_at = excluded.updated_at
    `).bind(auth.userId, templateId, scheduleJson, now).run();

    return jsonResponse({
      success: true,
      schedule: {
        templateId,
        scheduleData,
        updatedAt: now
      }
    }, 200);
  } catch (err: any) {
    return jsonResponse({ error: err.message || 'Internal server error' }, 500);
  }
}

export async function onRequestOptions() {
  return jsonResponse({}, 200);
}
