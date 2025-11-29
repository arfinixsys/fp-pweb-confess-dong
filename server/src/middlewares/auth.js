// simple admin check via header x-admin-token
require('dotenv').config();

const isAdmin = (req, res, next) => {
  const token = req.headers['x-admin-token'] || req.query.admin_token;
  if (!token) return res.status(401).json({ success: false, message: 'Admin token required' });
  if (token === process.env.ADMIN_TOKEN) return next();
  return res.status(403).json({ success: false, message: 'Forbidden' });
};

module.exports = { isAdmin };
