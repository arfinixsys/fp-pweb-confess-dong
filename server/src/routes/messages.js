const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const ctrl = require('../controllers/messagesControllers');
const { isAuthenticated } = require('../middlewares/auth');

// CREATE
router.post('/', isAuthenticated, upload.single('image'), ctrl.createMessage);
router.post('/:id/report', ctrl.reportMessage);
router.post('/:id/like', ctrl.likeMessage);      // ← endpoint like
router.post('/:id/unlike', ctrl.unlikeMessage);  // ← endpoint unlike

// READ
router.get('/', ctrl.listMessages);
router.get('/recipient/:name', ctrl.listByRecipient);
router.get('/:id', ctrl.getMessage);

// UPDATE
router.put('/:id', upload.single('image'), ctrl.updateMessage);
router.patch('/:id/anonymize', ctrl.setAnonymize);
router.patch('/:id/approve', ctrl.setApprove);

// DELETE
router.delete('/bulk', ctrl.bulkDelete);
router.delete('/:id/soft', ctrl.softDeleteMessage);
router.delete('/:id', ctrl.deleteMessage);

module.exports = router;