// src/controllers/authController.js
const db = require('../models/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'changeme-REPLACE_WITH_RANDOM_SECRET' || process.env.JWT_SECRET.length < 16) {
  throw new Error('JWT_SECRET must be set in .env and be a strong random string (min 16 chars).');
}
const JWT_SECRET = process.env.JWT_SECRET;

const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Username, email, and password required' });
    }

    // Check if user exists
    const existing = await db.query('SELECT id FROM users WHERE username = $1 OR email = $2', [username, email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Username or email already exists' });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Insert user (RETURNING id)
    const insertQ = 'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id';
    const info = await db.query(insertQ, [username, email, hashedPassword]);
    const newId = info.rows[0].id;

    // Generate token
    const token = jwt.sign({ id: newId, username }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { id: newId, username, email, token }
    });
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ success: false, message: 'Username and password required' });

    const result = await db.query('SELECT id, username, email, password FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) return res.status(401).json({ success: false, message: 'Invalid username or password' });

    const user = result.rows[0];
    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) return res.status(401).json({ success: false, message: 'Invalid username or password' });

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      success: true,
      message: 'Login successful',
      data: { id: user.id, username: user.username, email: user.email, token }
    });
  } catch (err) { next(err); }
};

const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await db.query('SELECT id, username, email, created_at FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'User not found' });

    return res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
};

module.exports = { register, login, getProfile };
