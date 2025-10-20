import { db } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import type { User } from '../models/types.js';

/**
 * 用户服务
 */
export class UserService {
  /**
   * 创建用户
   */
  createUser(username: string, email?: string): User {
    const id = uuidv4();
    const now = Date.now();

    const stmt = db.prepare(`
      INSERT INTO users (id, username, email, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(id, username, email || null, now, now);

    return {
      id,
      username,
      email,
      created_at: now,
      updated_at: now,
    };
  }

  /**
   * 根据ID获取用户
   */
  getUserById(id: string): User | null {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id) as User | null;
  }

  /**
   * 根据用户名获取用户
   */
  getUserByUsername(username: string): User | null {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    return stmt.get(username) as User | null;
  }

  /**
   * 获取或创建用户
   */
  getOrCreateUser(username: string, email?: string): User {
    let user = this.getUserByUsername(username);
    
    if (!user) {
      user = this.createUser(username, email);
    }
    
    return user;
  }

  /**
   * 更新用户
   */
  updateUser(id: string, updates: Partial<User>): boolean {
    const now = Date.now();
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.username !== undefined) {
      fields.push('username = ?');
      values.push(updates.username);
    }

    if (updates.email !== undefined) {
      fields.push('email = ?');
      values.push(updates.email);
    }

    if (fields.length === 0) return false;

    fields.push('updated_at = ?');
    values.push(now);
    values.push(id);

    const stmt = db.prepare(`
      UPDATE users 
      SET ${fields.join(', ')} 
      WHERE id = ?
    `);

    const result = stmt.run(...values);
    return result.changes > 0;
  }

  /**
   * 删除用户
   */
  deleteUser(id: string): boolean {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}

export const userService = new UserService();
