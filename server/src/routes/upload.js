const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const db = require('../models/db');

router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ success:false, message: 'file required' });
  const stmt = db.prepare('INSERT INTO uploads (filename, filepath) VALUES (?,?)');
  const info = stmt.run(req.file.originalname, `/uploads/${req.file.filename}`);
  const row = db.prepare('SELECT * FROM uploads WHERE id = ?').get(info.lastInsertRowid);
  res.json({ success: true, data: row });
});

router.delete('/:id', (req, res) => {
  const id = req.params.id;
  const row = db.prepare('SELECT * FROM uploads WHERE id = ?').get(id);
  if (!row) return res.status(404).json({ success:false, message:'Not found' });
  // remove file physically if exists
  const fs = require('fs');
  const fpath = require('path').join(__dirname, '../', row.filepath);
  try { if (fs.existsSync(fpath)) fs.unlinkSync(fpath); } catch(e){}
  db.prepare('DELETE FROM uploads WHERE id = ?').run(id);
  res.json({ success:true });
});

module.exports = router;
