const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { regexp } = require('../utils/regexp');
const { addMovie, getMovies, deleteMovie } = require('../controllers/movies');

router.get('/movies', getMovies);

router.post('/movies', celebrate({
  body: Joi.object().keys({
    country: Joi.string().required(),
    director: Joi.string().required(),
    duration: Joi.number().required(),
    description: Joi.string().required(),
    year: Joi.date().required(),
    nameRU: Joi.string().required(),
    nameEN: Joi.string().required(),
    image: Joi.string().required().pattern(regexp),
    trailerLink: Joi.string().required().pattern(regexp),
    thumbnail: Joi.string().required().pattern(regexp),
    movieId: Joi.number().required(),
  }),
}), addMovie);

router.delete('/movies/:movieId', celebrate({
  params: Joi.object().keys({
    movieId: Joi.string().hex().length(24),
  }),
}), deleteMovie);

module.exports = router;
