// src/controllers/adminAuthController.js
const jwt = require('jsonwebtoken');

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'; // ganti di .env
const JWT_SECRET = process.env.JWT_SECRET;

exports.adminLogin = (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ success: false, message: 'Username/password salah' });
    }

    const token = jwt.sign(
      { role: 'admin', username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({ success: true, token });
  } catch (err) {
    next(err);
  }
};
