require('dotenv').config();
const jwt = require('jsonwebtoken');

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'changeme-REPLACE_WITH_RANDOM_SECRET' || process.env.JWT_SECRET.length < 16) {
  throw new Error('JWT_SECRET must be set in .env and be a strong random string (min 16 chars).');
}
const JWT_SECRET = process.env.JWT_SECRET;

// Admin check via header x-admin-token
const isAdmin = (req, res, next) => {
  const token = req.headers['x-admin-token'] || req.query.admin_token;
  if (!token) return res.status(401).json({ success: false, message: 'Admin token required' });
  if (token === process.env.ADMIN_TOKEN) return next();
  return res.status(403).json({ success: false, message: 'Forbidden' });
};

// User check via JWT bearer token
const isAuthenticated = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
};

module.exports = { isAdmin, isAuthenticated };
