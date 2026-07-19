import bcrypt from 'bcrypt';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { db } from '../config/database.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/app_error.js';

type RegisterInput = { email: string; password: string; first_name: string; last_name: string };
type LoginInput = { email: string; password: string };

function create_token(user_id: string, role: string): string {
  return jwt.sign({ user_id, role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as NonNullable<SignOptions['expiresIn']>,
  });
}

export async function register_user(input: RegisterInput) {
  const password_hash = await bcrypt.hash(input.password, 12);
  try {
    const result = await db.query(
      `INSERT INTO users (email, password_hash, first_name, last_name)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, first_name, last_name, role, created_at`,
      [input.email.toLowerCase(), password_hash, input.first_name, input.last_name],
    );
    const user = result.rows[0];
    return { user, access_token: create_token(user.id, user.role) };
  } catch (error: unknown) {
    if (typeof error === 'object' && error && 'code' in error && error.code === '23505') {
      throw new AppError(409, 'email_exists', 'Email is already registered');
    }
    throw error;
  }
}

export async function login_user(input: LoginInput) {
  const result = await db.query(
    `SELECT id, email, password_hash, first_name, last_name, role
     FROM users
     WHERE email = $1 AND deleted_at IS NULL`,
    [input.email.toLowerCase()],
  );
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(input.password, user.password_hash))) {
    throw new AppError(401, 'invalid_credentials', 'Email or password is incorrect');
  }

  return {
    user: { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, role: user.role },
    access_token: create_token(user.id, user.role),
  };
}
