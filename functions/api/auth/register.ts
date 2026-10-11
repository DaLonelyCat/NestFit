import { Env, jsonResponse, hashPassword, signToken } from '../_utils';

export async function onRequestPost(context: { request: Request; env: Env }) {
  try {
    const { request, env } = context;
    const body = await request.json() as { email?: string; password?: string; name?: string };
    const { email, password, name } = body || {};

    if (!email || !email.includes('@')) {
      return jsonResponse({ error: 'Valid email address is required' }, 400);
    }
    if (!password || password.length < 6) {
      return jsonResponse({ error: 'Password must be at least 6 characters' }, 400);
    }
    if (!name || name.trim().length === 0) {
      return jsonResponse({ error: 'Name is required' }, 400);
    }

    if (!env.DB) {
      return jsonResponse({ error: 'Database binding (DB) is not configured' }, 503);
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();

    // Check if email already registered
    const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(cleanEmail).first();
    if (existing) {
      return jsonResponse({ error: 'An account with this email already exists' }, 409);
    }

    const userId = crypto.randomUUID();
    const passwordHash = await hashPassword(password);
    const createdAt = new Date().toISOString();

    await env.DB.prepare(
      'INSERT INTO users (id, email, password_hash, name, created_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(userId, cleanEmail, passwordHash, cleanName, createdAt).run();

    const secret = env.JWT_SECRET || 'nestfit-default-jwt-secret-key';
    const token = await signToken({ userId, email: cleanEmail }, secret);

    return jsonResponse({
      user: {
        id: userId,
        email: cleanEmail,
        name: cleanName,
        createdAt
      },
      token
    }, 201);
  } catch (err: any) {
    return jsonResponse({ error: err.message || 'Internal server error' }, 500);
  }
}

export async function onRequestOptions() {
  return jsonResponse({}, 200);
}
