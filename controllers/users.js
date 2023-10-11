const bcrypt = require('bcrypt');
// const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');

// eslint-disable-next-line import/no-unresolved
const userModel = require('../models/user');

const { NODE_ENV, JWT_SECRET } = process.env;

const {
  HTTP_STATUS_OK,
  HTTP_STATUS_CREATED,
  // eslint-disable-next-line import/order
} = require('http2').constants;

const BadRequestError = require('../errors/BadRequestError');
const UnauthorizedError = require('../errors/UnauthorizedError');
const NotFoundError = require('../errors/NotFoundError');
const ConflictError = require('../errors/ConflictError');

const SALT_ROUNDS = 10;

// Список всех пользователей
module.exports.getUsers = (req, res, next) => {
  userModel
    .find({})
    .then((user) => res.send(user))
    .catch(next);
};

// Найти текущего пользователя
module.exports.getUser = (req, res, next) => {
  // const id = req.user._id;
  const id = req.user._id;
  console.log(id);
  console.log(req.user);
  userModel
    .findById(id)
    .orFail()
    .then((user) => res.status(HTTP_STATUS_OK).send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(
          new BadRequestError(
            'Некорректные данные при поиске пользователя по _id',
          ),
        );
      } else if (err.name === 'DocumentNotFoundError') {
        next(new NotFoundError('Пользователь по указанному id не найден'));
      } else {
        next(err);
      }
    });
};

// Найти пользователя по id
module.exports.getUserById = (req, res, next) => {
  // const  {id}  = req.user._id;
  const { id } = req.params;
  // const { id } = req.user;
  console.log(id);
  userModel
    .findById(id)
    .orFail()
    .then((user) => res.status(HTTP_STATUS_OK).send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(
          new BadRequestError(
            'Некорректные данные при поиске пользователя по _id',
          ),
        );
      } else if (err.name === 'DocumentNotFoundError') {
        next(new NotFoundError('Пользователь по указанному id не найден'));
      } else {
        next(err);
      }
    });
};

// Регистрируем пользователя
module.exports.createUser = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;

  bcrypt
    .hash(password, SALT_ROUNDS)
    .then((hash) => userModel.create({
      name,
      email,
      password: hash,
    }))

    .then((user) =>
      // const { id } = user;
      // eslint-disable-next-line implicit-arrow-linebreak
      res.status(HTTP_STATUS_CREATED).send({
        name: user.name,
        email: user.email,
      }))
    .catch((e) => {
      console.log(e.name);
      if (e.code === 11000) {
        return next(new ConflictError('Такой пользователь уже существует'));
      } if (e.name === 'ValidationError') {
        return next(
          new BadRequestError(
            'Переданы некорректные данные при создании пользователя',
          ),
        );
      }
      return next(e);
    });
};

// login
module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return userModel
    .findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) {
        throw new UnauthorizedError('Неверный логин или пароль');
        // return res.status(FORBIDDEN).send({ message: "Неверный логин" });
      }
      bcrypt.compare(password, user.password, (err, isValid) => {
        if (!isValid) {
          return next(new UnauthorizedError('Неверный логин или пароль'));
          // return res.status(UNAUTHORIZED).send({ message: "Неверный пароль" });
        }

        const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'secret', {
          expiresIn: '7d',
        });
        console.log(user._id);
        return res.status(HTTP_STATUS_OK).send({ token });
      });
    })
    .catch(next);
};

// Обновить профиль
module.exports.updateUser = (req, res, next) => {
  const { name, email } = req.body;

  userModel
    .findByIdAndUpdate(
      req.user._id,
      { name, email },
      { new: true, runValidators: true },
    )

    .orFail()
    .then((user) => res.send({ user }))
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        next(
          new BadRequestError(
            'Переданы некорректные данные при обновлении профиля',
          ),
        );
      } else if (err.name === 'DocumentNotFoundError') {
        next(new NotFoundError('Пользователь с указанным _id не найден'));
      } else {
        next(err);
      }
    });
};
