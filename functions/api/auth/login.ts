import { Env, jsonResponse, verifyPassword, signToken } from '../_utils';

export async function onRequestPost(context: { request: Request; env: Env }) {
  try {
    const { request, env } = context;
    const body = await request.json() as { email?: string; password?: string };
    const { email, password } = body || {};

    if (!email || !password) {
      return jsonResponse({ error: 'Email and password are required' }, 400);
    }

    if (!env.DB) {
      return jsonResponse({ error: 'Database binding (DB) is not configured' }, 503);
    }

    const cleanEmail = email.toLowerCase().trim();

    const user = await env.DB.prepare(
      'SELECT id, email, password_hash, name, created_at FROM users WHERE email = ?'
    ).bind(cleanEmail).first<{
      id: string;
      email: string;
      password_hash: string;
      name: string;
      created_at: string;
    }>();

    if (!user) {
      return jsonResponse({ error: 'Invalid email or password' }, 401);
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return jsonResponse({ error: 'Invalid email or password' }, 401);
    }

    // Retrieve user's schedule if exists
    const scheduleRecord = await env.DB.prepare(
      'SELECT template_id, schedule_data, updated_at FROM user_schedules WHERE user_id = ?'
    ).bind(user.id).first<{
      template_id: string;
      schedule_data: string;
      updated_at: string;
    }>();

    const secret = env.JWT_SECRET || 'nestfit-default-jwt-secret-key';
    const token = await signToken({ userId: user.id, email: user.email }, secret);

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
      token,
      schedule
    }, 200);
  } catch (err: any) {
    return jsonResponse({ error: err.message || 'Internal server error' }, 500);
  }
}

export async function onRequestOptions() {
  return jsonResponse({}, 200);
}
