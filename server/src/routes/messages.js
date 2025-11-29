const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const ctrl = require('../controllers/messagesControllers');

// Create
router.post('/', upload.single('image'), ctrl.createMessage);
router.post('/:id/report', ctrl.reportMessage);
router.post('/:id/like', ctrl.likeMessage);
router.post('/:id/image', upload.single('image'), ctrl.updateImage);

// Read
router.get('/', ctrl.listMessages);
router.get('/recipient/:name', ctrl.listByRecipient);
router.get('/:id', ctrl.getMessage);

// Update
router.put('/:id', upload.single('image'), ctrl.updateMessage);
router.patch('/:id/anonymize', ctrl.setAnonymize);
router.patch('/:id/approve', ctrl.setApprove);

// Delete
router.delete('/:id', ctrl.deleteMessage);
router.delete('/:id/soft', ctrl.softDeleteMessage);
router.delete('/bulk', ctrl.bulkDelete);

module.exports = router;
