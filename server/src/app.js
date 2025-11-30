const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const messagesRouter = require('./routes/messages');
const uploadsRouter = require('./routes/upload');
const adminRouter = require('./routes/admin');
const authRouter = require('./routes/auth');
const { errorHandler } = require('./middlewares/errorHandler');
const { limiter } = require('./middlewares/rateLimiter');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(limiter);

// static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// routes
app.use('/api/v1/messages', messagesRouter);
app.use('/api/v1/uploads', uploadsRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/auth', authRouter);

// error
app.use(errorHandler);

module.exports = app;
