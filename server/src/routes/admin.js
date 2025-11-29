const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middlewares/auth');
const db = require('../models/db');

router.get('/messages', isAdmin, (req, res) => {
  const reportedOnly = req.query.reportedOnly === '1';
  let rows;
  if (reportedOnly) rows = db.prepare('SELECT * FROM messages WHERE reports_count > 0').all();
  else rows = db.prepare('SELECT * FROM messages').all();
  res.json({ success:true, data: rows });
});

module.exports = router;
