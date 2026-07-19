declare global {
  namespace Express {
    interface Request {
      user?: { user_id: string; role: 'admin' | 'staff' | 'customer' };
    }
  }
}

export {};
