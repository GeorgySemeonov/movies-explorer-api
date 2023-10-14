/* eslint-disable import/no-extraneous-dependencies */
const rateLimit = require('express-rate-limit');

const rateLimiter = rateLimit({
  windowMs: 1440 * 60 * 1000,
  max: 500,
  message: 'Было превышено число запросов по данному адресу',
});

module.exports = { rateLimiter };
