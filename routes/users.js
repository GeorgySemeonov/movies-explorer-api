const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
// const { regexp } = require('../utils/regexp');
const {
  getUsers, getUserById, updateUser, getUser,
} = require('../controllers/users');

router.get('/users', getUsers);
router.get('/users/me', getUser);

router.get(
  '/users/:id',
  celebrate({
    params: Joi.object().keys({
      id: Joi.string().length(24).hex().required(),
    }),
  }),
  getUserById,
);

// router.post("/users", createUser);
router.patch(
  '/users/me',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30).required(),
      about: Joi.string().min(2).max(30).required(),
    }),
  }),
  updateUser,
);

// router.patch(
//   '/users/me/avatar',
//   celebrate({
//     body: Joi.object().keys({
//       avatar: Joi.string().pattern(regexp),
//     }),
//   }),
//   updateAvatar,
// );

// router.post("/signin", login);
// router.post('/signup', createUser);

module.exports = router;
