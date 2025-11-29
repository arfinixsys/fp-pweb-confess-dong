const db = require('../models/db');
const fs = require('fs');
const path = require('path');

const createMessage = (req, res, next) => {
  try {
    const { sender_name, is_anonymous = 0, recipient_name, message } = req.body;
    if (!recipient_name || !message) return res.status(400).json({ success:false, message:'recipient and message required' });

    let image_path = null;
    if (req.file) image_path = `/uploads/${req.file.filename}`;

    const stmt = db.prepare('INSERT INTO messages (sender_name,is_anonymous,recipient_name,message,image_path) VALUES (?,?,?,?,?)');
    const info = stmt.run(sender_name || null, is_anonymous ? 1 : 0, recipient_name, message, image_path);
    const row = db.prepare('SELECT * FROM messages WHERE id = ?').get(info.lastInsertRowid);
    if (row.is_anonymous) row.sender_name = 'Anon';
    return res.status(201).json({ success:true, data: row });
  } catch (err) { next(err); }
};

const listMessages = (req, res, next) => {
  try {
    const page = parseInt(req.query.page||1);
    const pageSize = parseInt(req.query.pageSize||10);
    const offset = (page-1)*pageSize;
    const recipient = req.query.recipient;
    const where = ['is_deleted = 0', 'is_approved = 1'];
    const params = [];

    if (recipient) { where.push('recipient_name LIKE ?'); params.push(`%${recipient}%`); }

    const totalStmt = db.prepare(`SELECT COUNT(*) as cnt FROM messages WHERE ${where.join(' AND ')}`);
    const total = totalStmt.get(...params).cnt;

    const stmt = db.prepare(`SELECT * FROM messages WHERE ${where.join(' AND ')} ORDER BY created_at DESC LIMIT ? OFFSET ?`);
    const rows = stmt.all(...params, pageSize, offset).map(r => {
      if (r.is_anonymous) r.sender_name = 'Anon';
      return r;
    });

    return res.json({ success:true, data: rows, meta: { page, pageSize, total } });
  } catch (err) { next(err); }
};

const getMessage = (req, res, next) => {
  try {
    const id = req.params.id;
    const row = db.prepare('SELECT * FROM messages WHERE id = ? AND is_deleted = 0').get(id);
    if (!row) return res.status(404).json({ success:false, message:'Not found' });
    if (row.is_anonymous) row.sender_name = 'Anon';
    return res.json({ success:true, data: row });
  } catch (err) { next(err); }
};

const listByRecipient = (req, res, next) => {
  try {
    const name = req.params.name;
    const stmt = db.prepare('SELECT * FROM messages WHERE recipient_name LIKE ? AND is_deleted = 0 AND is_approved = 1 ORDER BY created_at DESC');
    const rows = stmt.all(`%${name}%`).map(r => { if (r.is_anonymous) r.sender_name = 'Anon'; return r; });
    return res.json({ success:true, data: rows });
  } catch (err) { next(err); }
};

const reportMessage = (req, res, next) => {
  try {
    const id = req.params.id;
    const reason = req.body.reason || null;
    db.prepare('INSERT INTO reports (message_id,reason) VALUES (?,?)').run(id, reason);
    db.prepare('UPDATE messages SET reports_count = reports_count + 1 WHERE id = ?').run(id);
    return res.json({ success:true, message:'Reported' });
  } catch (err) { next(err); }
};

const likeMessage = (req, res, next) => {
  try {
    const id = req.params.id;
    db.prepare('UPDATE messages SET likes_count = likes_count + 1 WHERE id = ?').run(id);
    const row = db.prepare('SELECT likes_count FROM messages WHERE id = ?').get(id);
    return res.json({ success:true, data: row });
  } catch (err) { next(err); }
};

const updateMessage = (req, res, next) => {
  try {
    const id = req.params.id;
    const { recipient_name, message, is_anonymous } = req.body;
    let image_path = null;
    if (req.file) image_path = `/uploads/${req.file.filename}`;

    const stmt = db.prepare('UPDATE messages SET recipient_name = COALESCE(?,recipient_name), message = COALESCE(?,message), image_path = COALESCE(?,image_path), is_anonymous = COALESCE(?,is_anonymous), updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(recipient_name, message, image_path, is_anonymous, id);

    const row = db.prepare('SELECT * FROM messages WHERE id = ?').get(id);
    if (row.is_anonymous) row.sender_name = 'Anon';
    return res.json({ success:true, data: row });
  } catch (err) { next(err); }
};

const setAnonymize = (req,res,next) => {
  try {
    const id = req.params.id;
    const is_anonymous = req.body.is_anonymous ? 1 : 0;
    db.prepare('UPDATE messages SET is_anonymous = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(is_anonymous, id);
    return res.json({ success:true });
  } catch (err) { next(err); }
};

const setApprove = (req,res,next) => {
  try {
    const id = req.params.id;
    const is_approved = req.body.is_approved ? 1 : 0;
    db.prepare('UPDATE messages SET is_approved = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(is_approved, id);
    return res.json({ success:true });
  } catch (err) { next(err); }
};

const updateImage = (req,res,next) => {
  try {
    const id = req.params.id;
    if (!req.file) return res.status(400).json({ success:false, message:'Image required' });
    const image_path = `/uploads/${req.file.filename}`;
    db.prepare('UPDATE messages SET image_path = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(image_path, id);
    return res.json({ success:true, data: { image_path } });
  } catch (err) { next(err); }
};

const deleteMessage = (req,res,next) => {
  try {
    const id = req.params.id;
    db.prepare('DELETE FROM messages WHERE id = ?').run(id);
    return res.json({ success:true });
  } catch (err) { next(err); }
};

const softDeleteMessage = (req,res,next) => {
  try {
    const id = req.params.id;
    db.prepare('UPDATE messages SET is_deleted = 1 WHERE id = ?').run(id);
    return res.json({ success:true });
  } catch (err) { next(err); }
};

const bulkDelete = (req,res,next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) return res.status(400).json({ success:false, message:'ids array required' });
    const placeholders = ids.map(()=>'?').join(',');
    const stmt = db.prepare(`DELETE FROM messages WHERE id IN (${placeholders})`);
    const info = stmt.run(...ids);
    return res.json({ success:true, deletedCount: info.changes });
  } catch (err) { next(err); }
};

module.exports = {
  createMessage, listMessages, getMessage, listByRecipient,
  reportMessage, likeMessage, updateMessage, setAnonymize, setApprove, updateImage,
  deleteMessage, softDeleteMessage, bulkDelete
};
