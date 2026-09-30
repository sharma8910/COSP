import { Router } from 'express';
import argon2 from 'argon2';
import { User } from '../models/User.js';
import { config } from '../config.js';
import { requireAuth, setSessionCookie } from '../auth.js';

const router = Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, notificationSettings: user.notificationSettings };
}

router.post('/register', async (request, response, next) => {
  try {
    const { name, email, password } = request.body;
    if (!name || !email || !emailPattern.test(email) || typeof password !== 'string' || password.length < 8) {
      return response.status(400).json({ error: 'Name, valid email, and password of at least 8 characters are required' });
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail })) return response.status(409).json({ error: 'Email is already registered' });
    const user = await User.create({ name: name.trim(), email: normalizedEmail, passwordHash: await argon2.hash(password) });
    setSessionCookie(response, user._id);
    return response.status(201).json({ user: publicUser(user) });
  } catch (error) { return next(error); }
});

router.post('/login', async (request, response, next) => {
  try {
    const { email, password } = request.body;
    const user = await User.findOne({ email: String(email || '').trim().toLowerCase() }).select('+passwordHash');
    if (!user || typeof password !== 'string' || !(await argon2.verify(user.passwordHash, password))) {
      return response.status(401).json({ error: 'Invalid email or password' });
    }
    setSessionCookie(response, user._id);
    return response.json({ user: publicUser(user) });
  } catch (error) { return next(error); }
});

router.post('/logout', (request, response) => {
  response.clearCookie(config.cookieName, { httpOnly: true, secure: config.isProduction, sameSite: 'lax' });
  return response.status(204).send();
});

router.get('/me', requireAuth, (request, response) => response.json({ user: publicUser(request.user) }));

export default router;
