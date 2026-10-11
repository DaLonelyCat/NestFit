import { Env, jsonResponse, getAuthUser } from '../_utils';

export async function onRequestGet(context: { request: Request; env: Env }) {
  try {
    const { request, env } = context;
    if (!env.DB) {
      return jsonResponse({ error: 'Database binding (DB) is not configured' }, 503);
    }

    const secret = env.JWT_SECRET || 'nestfit-default-jwt-secret-key';
    const auth = await getAuthUser(request, secret);
    if (!auth) {
      return jsonResponse({ error: 'Unauthorized or expired session' }, 401);
    }

    const user = await env.DB.prepare(
      'SELECT id, email, name, created_at FROM users WHERE id = ?'
    ).bind(auth.userId).first<{
      id: string;
      email: string;
      name: string;
      created_at: string;
    }>();

    if (!user) {
      return jsonResponse({ error: 'User not found' }, 404);
    }

    const scheduleRecord = await env.DB.prepare(
      'SELECT template_id, schedule_data, updated_at FROM user_schedules WHERE user_id = ?'
    ).bind(user.id).first<{
      template_id: string;
      schedule_data: string;
      updated_at: string;
    }>();

    let schedule = null;
    if (scheduleRecord && scheduleRecord.schedule_data) {
      try {
        schedule = {
          templateId: scheduleRecord.template_id,
          scheduleData: JSON.parse(scheduleRecord.schedule_data),
          updatedAt: scheduleRecord.updated_at
        };
      } catch {
        schedule = null;
      }
    }

    return jsonResponse({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.created_at
      },
      schedule
    }, 200);
  } catch (err: any) {
    return jsonResponse({ error: err.message || 'Internal server error' }, 500);
  }
}

export async function onRequestOptions() {
  return jsonResponse({}, 200);
}
