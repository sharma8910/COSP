import jwt from 'jsonwebtoken';
import { config } from './config.js';
import { User } from './models/User.js';

export function setSessionCookie(response, userId) {
  const token = jwt.sign({ sub: userId.toString() }, config.jwtSecret, { expiresIn: '7d' });
  response.cookie(config.cookieName, token, {
    httpOnly: true,//cookie is not accessible via JavaScript in 
                     //the browser, which helps prevent XSS attacks
    secure: config.isProduction,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

export async function requireAuth(request, response, next) {
  try {
    const token = request.cookies[config.cookieName];
    if (!token) return response.status(401).json({ error: 'Authentication required' });
    const payload = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(payload.sub);
    if (!user) return response.status(401).json({ error: 'U need to register' });
    request.user = user;
    return next();
  } catch {
    return response.status(401).json({ error: 'Authentication required' });
  }
}
