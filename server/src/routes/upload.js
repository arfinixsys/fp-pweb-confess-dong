// src/routes/upload.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const db = require('../models/db');
const fs = require('fs');
const path = require('path');

router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success:false, message: 'file required' });

    const insertQ = `INSERT INTO uploads (filename, filepath) VALUES ($1, $2) RETURNING *`;
    const filepath = `/uploads/${req.file.filename}`;
    const result = await db.query(insertQ, [req.file.originalname, filepath]);

    res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const rowRes = await db.query('SELECT * FROM uploads WHERE id = $1', [id]);
    if (rowRes.rows.length === 0) return res.status(404).json({ success:false, message:'Not found' });

    const row = rowRes.rows[0];
    // remove file physically if exists
    const fpath = path.join(__dirname, '../', row.filepath);
    try { if (fs.existsSync(fpath)) fs.unlinkSync(fpath); } catch(e){}

    await db.query('DELETE FROM uploads WHERE id = $1', [id]);
    res.json({ success:true });
  } catch (err) { next(err); }
});

module.exports = router;
