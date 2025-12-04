const db = require('../models/db');

const createMessage = async (req, res, next) => {
  try {
    const { sender_name, is_anonymous, recipient_name, message, image_url } = req.body;

    if (!recipient_name || !message)
      return res.status(400).json({ success: false, message: 'recipient and message required' });

    const user = req.user || null;

    // ✅ LOGIC BARU:
    let finalSender = null;
    let finalAnon = is_anonymous === true || is_anonymous === 'true' || is_anonymous === 1;

    if (finalAnon) {
      // Kalau anonymous dicentang → sender_name jadi null (akan ditampilkan "Anon")
      finalSender = null;
    } else {
      // Kalau tidak anonymous → pakai username dari user yang login, atau input manual
      finalSender = user ? user.username : (sender_name || null);
    }

    const image_path = image_url || null;

    const q = `
      INSERT INTO messages (user_id, sender_name, is_anonymous, recipient_name, message, image_path)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *;
    `;

    const result = await db.query(q, [
      user ? user.id : null,
      finalSender,
      finalAnon,
      recipient_name,
      message,
      image_path
    ]);

    const row = result.rows[0];
    
    // ✅ Override display name di response
    if (row.is_anonymous) {
      row.sender_name = "Anon";
    }

    res.status(201).json({ success: true, data: row });

  } catch (err) { next(err); }
};


const listMessages = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || 1);
    const pageSize = parseInt(req.query.pageSize || 10);
    const offset = (page - 1) * pageSize;
    const recipient = req.query.recipient;

    const where = ['is_deleted = FALSE', 'is_approved = TRUE'];
    const params = [];

    if (recipient) {
      params.push(`%${recipient}%`);
      where.push(`recipient_name ILIKE $${params.length}`);
    }

    const totalQuery = `SELECT COUNT(*) AS cnt FROM messages WHERE ${where.join(' AND ')}`;
    const totalResult = await db.query(totalQuery, params);
    const total = parseInt(totalResult.rows[0].cnt, 10);

    params.push(pageSize);
    params.push(offset);

    const dataQuery = `
      SELECT * FROM messages
      WHERE ${where.join(' AND ')}
      ORDER BY created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length};
    `;

    const dataResult = await db.query(dataQuery, params);
    const rows = dataResult.rows.map(r => {
      if (r.is_anonymous) r.sender_name = 'Anon';
      return r;
    });

    res.json({ success: true, data: rows, meta: { page, pageSize, total } });
  } catch (err) { next(err); }
};

const getMessage = async (req, res, next) => {
  try {
    const q = `
      SELECT * FROM messages
      WHERE id = $1 AND is_deleted = FALSE
    `;

    const result = await db.query(q, [req.params.id]);

    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: 'Not found' });

    const msg = result.rows[0];
    if (msg.is_anonymous) msg.sender_name = 'Anon';

    res.json({ success: true, data: msg });
  } catch (err) { next(err); }
};

const listByRecipient = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT * FROM messages 
       WHERE recipient_name ILIKE $1
       AND is_deleted = FALSE 
       AND is_approved = TRUE
       ORDER BY created_at DESC`,
      [`%${req.params.name}%`]
    );

    const rows = result.rows.map(r => {
      if (r.is_anonymous) r.sender_name = 'Anon';
      return r;
    });

    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

const reportMessage = async (req, res, next) => {
  try {
    const id = req.params.id;

    const exists = await db.query(`SELECT id FROM messages WHERE id=$1`, [id]);
    if (exists.rows.length === 0)
      return res.status(404).json({ success: false, message: 'Message not found' });

    await db.query(`INSERT INTO reports (message_id, reason) VALUES ($1,$2)`, [id, req.body.reason || null]);
    await db.query(`UPDATE messages SET reports_count = reports_count + 1 WHERE id=$1`, [id]);

    res.json({ success: true, message: 'Reported' });
  } catch (err) { next(err); }
};

// ✅ LIKE (increment)
const likeMessage = async (req, res, next) => {
  try {
    const messageId = req.params.id;

    await db.query(
      `UPDATE messages SET likes_count = likes_count + 1 WHERE id = $1`,
      [messageId]
    );

    const row = await db.query(
      `SELECT likes_count FROM messages WHERE id = $1`,
      [messageId]
    );

    res.json({ 
      success: true, 
      likes_count: row.rows[0].likes_count,
      action: 'like'
    });
  } catch (err) { 
    next(err); 
  }
};

// ✅ UNLIKE (decrement)
const unlikeMessage = async (req, res, next) => {
  try {
    const messageId = req.params.id;

    await db.query(
      `UPDATE messages 
       SET likes_count = GREATEST(0, likes_count - 1) 
       WHERE id = $1`,
      [messageId]
    );

    const row = await db.query(
      `SELECT likes_count FROM messages WHERE id = $1`,
      [messageId]
    );

    res.json({ 
      success: true, 
      likes_count: row.rows[0].likes_count,
      action: 'unlike'
    });
  } catch (err) { 
    next(err); 
  }
};

const updateMessage = async (req, res, next) => {
  try {
    const { recipient_name, message, is_anonymous, image_url } = req.body;

    const image_path = image_url || null;

    const q = `
      UPDATE messages
      SET 
        recipient_name = COALESCE($1, recipient_name),
        message        = COALESCE($2, message),
        image_path     = COALESCE($3, image_path),
        is_anonymous   = COALESCE($4, is_anonymous),
        updated_at     = NOW()
      WHERE id = $5
      RETURNING *;
    `;

    const result = await db.query(q, [
      recipient_name,
      message,
      image_path,
      is_anonymous,
      req.params.id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    const row = result.rows[0];
    if (row.is_anonymous) row.sender_name = "Anon";

    res.json({ success: true, data: row });

  } catch (err) { next(err); }
};

const setAnonymize = async (req, res, next) => {
  try {
    const id = req.params.id;
    const is_anonymous = req.body.is_anonymous ? true : false;
    
    console.log('🔧 Setting anonymize:', { id, is_anonymous }); // ← tambahkan log
    
    const result = await db.query(
      `UPDATE messages 
       SET is_anonymous = $1, updated_at = NOW() 
       WHERE id = $2
       RETURNING *`,
      [is_anonymous, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    console.log('✅ Updated:', result.rows[0]); // ← tambahkan log

    res.json({ success: true, data: result.rows[0] });
  } catch (err) { 
    console.error('❌ Error setAnonymize:', err);
    next(err); 
  }
};


const setApprove = async (req, res, next) => {
  try {
    const id = req.params.id;
    const is_approved = req.body.is_approved ? true : false;
    
    const result = await db.query(
      `UPDATE messages 
       SET is_approved = $1, updated_at = NOW() 
       WHERE id = $2
       RETURNING *`,
      [is_approved, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) { 
    console.error('Error setApprove:', err);
    next(err); 
  }
};

const deleteMessage = async (req, res, next) => {
  try {
    const result = await db.query(`DELETE FROM messages WHERE id=$1`, [req.params.id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    res.json({ success: true });
  } catch (err) { next(err); }
};

const softDeleteMessage = async (req, res, next) => {
  try {
    const result = await db.query(
      `UPDATE messages SET is_deleted = TRUE WHERE id = $1`, 
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    res.json({ success: true });
  } catch (err) { next(err); }
};

const bulkDelete = async (req, res, next) => {
  try {
    const { ids } = req.body;

    // ✅ Validasi input
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'ids array required and must not be empty' 
      });
    }

    // ✅ Validasi semua ID adalah integer
    if (!ids.every(id => Number.isInteger(id))) {
      return res.status(400).json({ 
        success: false, 
        message: 'All ids must be integers' 
      });
    }

    const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
    const q = `DELETE FROM messages WHERE id IN (${placeholders})`;
    const result = await db.query(q, ids);

    res.json({ 
      success: true, 
      deletedCount: result.rowCount,
      message: `${result.rowCount} message(s) deleted`
    });
  } catch (err) { 
    console.error('Error bulkDelete:', err);
    next(err); 
  }
};

module.exports = {
  createMessage, listMessages, getMessage, listByRecipient,
  reportMessage, 
  likeMessage,     // ← keep
  unlikeMessage,   // ← keep
  updateMessage,
  setAnonymize, setApprove, deleteMessage,
  softDeleteMessage, bulkDelete
};
