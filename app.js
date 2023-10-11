// eslint-disable-next-line import/no-extraneous-dependencies
require('dotenv').config();
const cors = require('cors');

const express = require('express');
const mongoose = require('mongoose');
// const { HTTP_STATUS_NOT_FOUND } = require('http2').constants;
// eslint-disable-next-line import/no-extraneous-dependencies
const helmet = require('helmet');
const { errors } = require('celebrate');
const { celebrate, Joi } = require('celebrate');
const MoviesRouter = require('./routes/movies');
const UserRouter = require('./routes/users');
const { login, createUser } = require('./controllers/users');
const { regexp } = require('./utils/regexp');
const NotFoundError = require('./errors/NotFoundError');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const auth = require('./middlewares/auth');

const app = express();
const { PORT = 3000 } = process.env;

mongoose.connect('mongodb://127.0.0.1:27017/mestodb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to DB');
  })
  .catch(() => {
    console.log('No connection to DB');
  });
app.use(cors());
app.use(helmet());

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадет');
  }, 0);
});

app.use(express.json());
app.use(requestLogger);

app.post('/api/sign-in', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);

app.post('/api/sign-up', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().pattern(regexp),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), createUser);

app.use(auth);
app.use('/api', MoviesRouter);
app.use('/api', UserRouter);
app.use('/*', (req, res, next) => next(new NotFoundError('Страница не найдена')));

app.use(errorLogger);
app.use(errors());
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res.status(statusCode).send(
    { message: statusCode === 500 ? 'На сервере произошла ошибка' : message },
  );
  console.log(message);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
