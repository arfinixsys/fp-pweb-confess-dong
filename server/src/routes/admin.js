const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middlewares/auth');
const db = require('../models/db');

router.get('/messages', isAdmin, async (req, res, next) => {
  try {
    const reportedOnly = req.query.reportedOnly === '1';

    let result;
    if (reportedOnly) {
      result = await db.query('SELECT * FROM messages WHERE reports_count > 0');
    } else {
      result = await db.query('SELECT * FROM messages');
    }

    res.json({ success: true, data: result.rows });

  } catch (err) {
    next(err);
  }
});

module.exports = router;
